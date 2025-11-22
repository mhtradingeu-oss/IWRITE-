/**
 * Seed script to create test users for IWRITE Phase 1
 * Usage: npx tsx scripts/seedUsers.ts
 * 
 * Environment variables:
 * - SEED_FREE_USER_EMAIL (default: test@example.com)
 * - SEED_FREE_USER_PASSWORD (default: Test1234)
 * - SEED_PRO_USER_EMAIL (default: mhtrading@gmail.com)
 * - SEED_PRO_USER_PASSWORD (default: test@123)
 * - SEED_PRO_USER_PLAN (default: PRO_MONTHLY)
 * - DATABASE_URL (required)
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { users } from "../shared/schema";
import bcrypt from "bcryptjs";

// Configuration from env vars
const SEED_FREE_EMAIL = process.env.SEED_FREE_USER_EMAIL || "test@example.com";
const SEED_FREE_PASSWORD = process.env.SEED_FREE_USER_PASSWORD || "Test1234";
const SEED_PRO_EMAIL = process.env.SEED_PRO_USER_EMAIL || "mhtrading@gmail.com";
const SEED_PRO_PASSWORD = process.env.SEED_PRO_USER_PASSWORD || "test@123";
const SEED_PRO_PLAN = process.env.SEED_PRO_USER_PLAN || "PRO_MONTHLY";

async function seedUsers() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is required");
    process.exit(1);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    console.log("🌱 Seeding users...");

    // Seed FREE user
    console.log(`\n📝 FREE User: ${SEED_FREE_EMAIL}`);
    const existingFreeUser = await db
      .select()
      .from(users)
      .where(eq(users.email, SEED_FREE_EMAIL));

    if (existingFreeUser.length > 0) {
      console.log("   ✓ Already exists (skipping)");
    } else {
      const passwordHash = await bcrypt.hash(SEED_FREE_PASSWORD, 10);
      await db.insert(users).values({
        email: SEED_FREE_EMAIL,
        passwordHash,
        plan: "FREE",
        dailyUsageCount: 0,
        dailyUsageDate: null,
      });
      console.log("   ✓ Created successfully");
    }

    // Seed PRO user
    console.log(`\n📝 PRO User: ${SEED_PRO_EMAIL}`);
    const existingProUser = await db
      .select()
      .from(users)
      .where(eq(users.email, SEED_PRO_EMAIL));

    if (existingProUser.length > 0) {
      console.log("   ✓ Already exists (skipping)");
    } else {
      const passwordHash = await bcrypt.hash(SEED_PRO_PASSWORD, 10);
      await db.insert(users).values({
        email: SEED_PRO_EMAIL,
        passwordHash,
        plan: SEED_PRO_PLAN as any,
        dailyUsageCount: 0,
        dailyUsageDate: null,
      });
      console.log("   ✓ Created successfully");
    }

    console.log("\n✅ Seeding complete!");
    console.log("\n📋 Test Credentials:");
    console.log(`\n  FREE Plan:`);
    console.log(`    Email: ${SEED_FREE_EMAIL}`);
    console.log(`    Password: ${SEED_FREE_PASSWORD}`);
    console.log(`\n  PRO Plan:`);
    console.log(`    Email: ${SEED_PRO_EMAIL}`);
    console.log(`    Password: ${SEED_PRO_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedUsers();
