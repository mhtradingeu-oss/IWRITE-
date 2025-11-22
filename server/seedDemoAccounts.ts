/**
 * Initialize demo accounts for testing if they don't already exist
 * This runs once at server startup and is development/staging only
 */

import { db } from "./storage";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

const DEMO_ACCOUNTS = [
  {
    email: "free@example.com",
    password: "FreeUser1234",
    plan: "FREE",
    role: "user",
    description: "Demo FREE account (5 AI ops/day)",
  },
  {
    email: "pro@example.com",
    password: "ProUser1234",
    plan: "PRO_MONTHLY",
    role: "user",
    description: "Demo PRO account (Unlimited)",
  },
  {
    email: "admin@example.com",
    password: "Admin1234",
    plan: "FREE",
    role: "admin",
    description: "Demo ADMIN account (Full Access)",
  },
];

export async function seedDemoAccounts() {
  try {
    console.log("[SEED] Checking demo accounts...");

    for (const account of DEMO_ACCOUNTS) {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, account.email));

      if (existing.length === 0) {
        const passwordHash = await hashPassword(account.password);
        await db.insert(users).values({
          email: account.email,
          passwordHash,
          plan: account.plan,
          role: account.role,
        });
        console.log(`[SEED] ✓ Created ${account.role.toUpperCase()} demo account: ${account.email}`);
      }
    }

    console.log("[SEED] Demo accounts ready");
  } catch (error: any) {
    console.error("[SEED] Error initializing demo accounts:", error.message);
    // Don't fail startup - demo accounts are optional
  }
}
