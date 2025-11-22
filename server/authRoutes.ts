import type { Express, Request, Response } from "express";
import { db } from "./storage";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, createToken, isValidEmail, isValidPassword } from "./auth";

export function registerAuthRoutes(app: Express) {
  // Register new user
  app.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const validation = isValidPassword(password);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors.join(", ") });
      }

      // Check if user exists
      const existing = await db.select().from(users).where(eq(users.email, email));
      if (existing.length > 0) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Create user
      const passwordHash = await hashPassword(password);
      const newUser = await db
        .insert(users)
        .values({
          email,
          passwordHash,
          plan: "FREE",
        })
        .returning();

      const user = newUser[0];
      const token = createToken({
        id: user.id,
        email: user.email,
        plan: user.plan,
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Login user
  app.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const result = await db.select().from(users).where(eq(users.email, email));
      if (result.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = result[0];
      const passwordMatch = await verifyPassword(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = createToken({
        id: user.id,
        email: user.email,
        plan: user.plan,
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Logout user
  app.post("/auth/logout", (req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  // Get current user
  app.get("/auth/me", (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({ user: req.user });
  });

  // Upgrade plan
  app.post("/auth/upgrade", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { plan } = req.body;
      if (!["FREE", "PRO_MONTHLY", "PRO_YEARLY"].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan" });
      }

      // Calculate plan expires at
      let planExpiresAt: Date | null = null;
      if (plan === "PRO_MONTHLY") {
        planExpiresAt = new Date();
        planExpiresAt.setMonth(planExpiresAt.getMonth() + 1);
      } else if (plan === "PRO_YEARLY") {
        planExpiresAt = new Date();
        planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 1);
      }

      const updated = await db
        .update(users)
        .set({
          plan,
          planStartedAt: new Date(),
          planExpiresAt,
        })
        .where(eq(users.id, req.user.id))
        .returning();

      const user = updated[0];
      const token = createToken({
        id: user.id,
        email: user.email,
        plan: user.plan,
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
