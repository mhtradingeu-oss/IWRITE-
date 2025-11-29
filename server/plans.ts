/**
 * Plan types and helper functions for IWRITE Phase 1
 * Simplifies the subscription model into FREE (limited) vs PAID (unlimited)
 */

import { SubscriptionPlan } from "@shared/schema";

// Configuration
export const FREE_DAILY_LIMIT = parseInt(process.env.FREE_DAILY_LIMIT || "20", 10);

/**
 * Check if a plan is a FREE plan with daily limits
 */
export function isFreePlan(plan: SubscriptionPlan): boolean {
  return plan === "FREE";
}

/**
 * Check if a plan is a paid plan with unlimited usage
 */
export function isPaidPlan(plan: SubscriptionPlan): boolean {
  return plan === "PRO_MONTHLY" || plan === "PRO_YEARLY";
}

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 */
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Check if a user has exceeded their daily usage limit
 */
export function hasExceededDailyLimit(
  plan: SubscriptionPlan,
  dailyUsageCount: number,
  dailyUsageDate: string | null
): boolean {
  // Paid plans have no limits
  if (isPaidPlan(plan)) {
    return false;
  }

  // Check if it's a new day
  const today = getTodayDate();
  if (dailyUsageDate !== today) {
    // New day, not exceeded yet
    return false;
  }

  // Same day, check against limit
  return dailyUsageCount >= FREE_DAILY_LIMIT;
}

/**
 * Get the remaining daily usage for a FREE user
 */
export function getRemainingDaily(
  plan: SubscriptionPlan,
  dailyUsageCount: number,
  dailyUsageDate: string | null
): number {
  // Paid plans have unlimited
  if (isPaidPlan(plan)) {
    return Infinity;
  }

  const today = getTodayDate();
  if (dailyUsageDate !== today) {
    // New day
    return FREE_DAILY_LIMIT;
  }

  // Same day
  return Math.max(0, FREE_DAILY_LIMIT - dailyUsageCount);
}
