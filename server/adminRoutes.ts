import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./storage";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "./index";

// Middleware to require admin access
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Check if user is admin by querying database
  try {
    const userRecord = await db.select().from(users).where(eq(users.id, req.user.id));
    if (userRecord.length === 0 || userRecord[0].role !== "admin") {
      return res.status(403).json({ error: "FORBIDDEN_ADMIN_ONLY" });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Failed to verify admin status" });
  }
}

export function registerAdminRoutes(app: Express) {
  // Get all users with their usage info
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const allUsers = await db.select().from(users);

      const usersData = allUsers.map((user) => ({
        id: user.id,
        email: user.email,
        plan: user.plan,
        dailyUsageCount: user.dailyUsageCount,
        dailyUsageDate: user.dailyUsageDate,
        createdAt: user.createdAt,
        planStartedAt: user.planStartedAt,
        planExpiresAt: user.planExpiresAt,
      }));

      res.json({ users: usersData });
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: error.message || "Failed to fetch users" });
    }
  });

  // Update user plan
  app.put("/api/admin/users/:id/plan", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { plan } = req.body;

      if (!["FREE", "PRO_MONTHLY", "PRO_YEARLY"].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan" });
      }

      // Update plan with appropriate expiration
      let planExpiresAt: Date | null = null;
      if (plan === "PRO_MONTHLY") {
        planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      } else if (plan === "PRO_YEARLY") {
        planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      }

      await db
        .update(users)
        .set({
          plan,
          planStartedAt: new Date(),
          planExpiresAt,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      const updatedUser = await db.select().from(users).where(eq(users.id, id));

      res.json({
        message: "Plan updated successfully",
        user: updatedUser[0],
      });
    } catch (error: any) {
      console.error("Error updating plan:", error);
      res.status(500).json({ error: error.message || "Failed to update plan" });
    }
  });

  // Reset user daily usage
  app.put("/api/admin/users/:id/reset-usage", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await db
        .update(users)
        .set({
          dailyUsageCount: 0,
          dailyUsageDate: new Date().toISOString().split("T")[0],
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      const updatedUser = await db.select().from(users).where(eq(users.id, id));

      res.json({
        message: "Usage reset successfully",
        user: updatedUser[0],
      });
    } catch (error: any) {
      console.error("Error resetting usage:", error);
      res.status(500).json({ error: error.message || "Failed to reset usage" });
    }
  });

  // Get system stats
  app.get("/api/admin/stats", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const allUsers = await db.select().from(users);

      const stats = {
        totalUsers: allUsers.length,
        freeUsers: allUsers.filter((u) => u.plan === "FREE").length,
        proUsers: allUsers.filter((u) => u.plan.startsWith("PRO")).length,
        totalDailyUsage: allUsers.reduce((sum, u) => sum + u.dailyUsageCount, 0),
        freeDailyLimit: parseInt(process.env.FREE_DAILY_LIMIT || "5"),
      };

      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: error.message || "Failed to fetch stats" });
    }
  });
}
