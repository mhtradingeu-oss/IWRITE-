// Helper functions for plan and role checks
export function isFree(plan: string | undefined): boolean {
  return plan === "FREE";
}

export function isPro(plan: string | undefined): boolean {
  return plan?.startsWith("PRO") ?? false;
}

export function isAdmin(role: string | undefined): boolean {
  return role === "admin";
}

export interface UserData {
  id: string;
  email: string;
  plan: "FREE" | "PRO_MONTHLY" | "PRO_YEARLY";
  role: "user" | "admin";
  dailyAiOperations?: number;
}

/**
 * Determines the correct redirect path based on user role and plan
 * Used after login and on app bootstrap to navigate users to the right destination
 */
export function getRedirectPath(user: UserData | null): string {
  if (!user) return "/login";
  if (isAdmin(user.role)) return "/admin";
  return "/dashboard";
}
