/**
 * Middleware for enforcing daily AI generation limits on FREE plans
 */

import { Request, Response, NextFunction } from "express";
import { db } from "./storage";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { isFreePlan, isPaidPlan, hasExceededDailyLimit, getTodayDate, getRemainingDaily, FREE_DAILY_LIMIT } from "./plans";

/**
 * Check if user has exceeded their daily AI generation limit
 * Returns 429 if limit exceeded, otherwise increments counter and continues
 */
export async function checkDailyLimit(req: Request, res: Response, next: NextFunction) {
  try {
    // Skip if no user (shouldn't happen with requireAuth, but be safe)
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user from database
    const userResult = await db.select().from(users).where(eq(users.id, req.user.id));
    if (userResult.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = userResult[0];
    const plan = user.plan as any;

    // Paid users have unlimited usage
    if (isPaidPlan(plan)) {
      return next();
    }

    // FREE users - check daily limit
    if (isFreePlan(plan)) {
      const today = getTodayDate();
      const exceededLimit = hasExceededDailyLimit(plan, user.dailyUsageCount, user.dailyUsageDate);

      if (exceededLimit) {
        return res.status(429).json({
          error: "FREE_DAILY_LIMIT_REACHED",
          message: `You have reached your free daily limit of ${FREE_DAILY_LIMIT} generations. Upgrade to the paid plan for unlimited use.`,
          limit: FREE_DAILY_LIMIT,
          used: user.dailyUsageCount,
        });
      }

      // Increment counter (reset if new day)
      const newCount = user.dailyUsageDate === today ? user.dailyUsageCount + 1 : 1;
      await db
        .update(users)
        .set({
          dailyUsageCount: newCount,
          dailyUsageDate: today,
          updatedAt: new Date(),
        })
        .where(eq(users.id, req.user.id));

      // Attach remaining usage to request for frontend feedback
      (req as any).remainingDaily = getRemainingDaily(plan, newCount, today);
    }

    next();
  } catch (error: any) {
    console.error("Error checking daily limit:", error);
    res.status(500).json({ error: "Failed to check usage limit" });
  }
}

/**
 * Helper to get user's remaining daily usage
 */
export async function getUserRemainingDaily(userId: string): Promise<number> {
  try {
    const userResult = await db.select().from(users).where(eq(users.id, userId));
    if (userResult.length === 0) return 0;

    const user = userResult[0];
    return getRemainingDaily(user.plan as any, user.dailyUsageCount, user.dailyUsageDate);
  } catch (error) {
    console.error("Error getting remaining daily:", error);
    return 0;
  }
}
