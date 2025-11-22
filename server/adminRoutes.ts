import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./storage";
import { users } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
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
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

      const usersData = allUsers.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        dailyUsageCount: user.dailyUsageCount,
        dailyUsageDate: user.dailyUsageDate,
        createdAt: user.createdAt,
        planStartedAt: user.planStartedAt,
        planExpiresAt: user.planExpiresAt,
        updatedAt: user.updatedAt,
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

  // Disable/Enable user account
  app.put("/api/admin/users/:id/status", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { disabled } = req.body;

      await db
        .update(users)
        .set({
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      const updatedUser = await db.select().from(users).where(eq(users.id, id));

      res.json({
        message: "User status updated",
        user: updatedUser[0],
      });
    } catch (error: any) {
      console.error("Error updating user status:", error);
      res.status(500).json({ error: error.message || "Failed to update user status" });
    }
  });

  // Get system stats
  app.get("/api/admin/stats", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const allUsers = await db.select().from(users);

      const totalDailyUsage = allUsers.reduce((sum, u) => sum + u.dailyUsageCount, 0);
      const avgDailyUsagePerUser = allUsers.length > 0 ? Math.round(totalDailyUsage / allUsers.length) : 0;

      const stats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter((u) => {
          if (u.dailyUsageDate) {
            const today = new Date().toISOString().split("T")[0];
            return u.dailyUsageDate === today;
          }
          return false;
        }).length,
        freeUsers: allUsers.filter((u) => u.plan === "FREE").length,
        proUsers: allUsers.filter((u) => u.plan.startsWith("PRO")).length,
        totalDailyUsage,
        avgDailyUsagePerUser,
        freeDailyLimit: parseInt(process.env.FREE_DAILY_LIMIT || "5"),
        usersNearLimit: allUsers.filter((u) => u.plan === "FREE" && u.dailyUsageCount >= 4).length,
      };

      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: error.message || "Failed to fetch stats" });
    }
  });

  // Get system health
  app.get("/api/admin/health", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const allUsers = await db.select().from(users);
      
      const health = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
        totalUsers: allUsers.length,
        system: {
          environment: process.env.NODE_ENV || "development",
          version: "1.0.0",
          uptime: process.uptime(),
        },
      };

      res.json(health);
    } catch (error: any) {
      res.status(500).json({
        status: "unhealthy",
        error: error.message || "System health check failed",
      });
    }
  });

  // Update daily rate limit
  app.put("/api/admin/settings/daily-limit", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { limit } = req.body;

      if (!limit || limit < 1 || limit > 100) {
        return res.status(400).json({ error: "Invalid limit value" });
      }

      // Store in environment (in production, this would be persisted)
      process.env.FREE_DAILY_LIMIT = limit.toString();

      res.json({
        message: "Daily limit updated",
        freeDailyLimit: limit,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to update daily limit" });
    }
  });
}
