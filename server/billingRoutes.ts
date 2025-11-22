import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import { db } from "./storage";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "./index";

// Lazy initialization of Stripe - only when API key is available
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripe = new Stripe(apiKey, {
      apiVersion: "2024-12-18.acacia",
    });
  }
  return stripe;
}

interface PaymentMetadata {
  userId: string;
  email: string;
  planType: string;
}

export function registerBillingRoutes(app: Express) {
  // Create checkout session
  app.post("/api/billing/create-checkout-session", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { planType } = req.body;

      if (!["monthly", "yearly"].includes(planType)) {
        return res.status(400).json({ error: "Invalid plan type" });
      }

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      const priceId = planType === "monthly" 
        ? process.env.STRIPE_PRICE_ID_MONTHLY
        : process.env.STRIPE_PRICE_ID_YEARLY;

      if (!priceId) {
        return res.status(500).json({ error: `Stripe price ID for ${planType} plan not configured` });
      }

      // Get frontend URL from environment or infer from request
      const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;

      // Create Stripe checkout session
      const session = await getStripe().checkout.sessions.create({
        mode: "subscription",
        customer_email: req.user.email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${frontendUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/plans?canceled=true`,
        metadata: {
          userId: req.user.id,
          email: req.user.email,
          planType: planType === "monthly" ? "PRO_MONTHLY" : "PRO_YEARLY",
        } as PaymentMetadata & Record<string, string>,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  // Webhook handler for Stripe events
  app.post("/api/billing/webhook", async (req: Request, res: Response) => {
    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.warn("STRIPE_WEBHOOK_SECRET not set - webhook signature verification skipped");
        return res.status(400).json({ error: "Webhook secret not configured" });
      }

      const sig = req.headers["stripe-signature"] as string;
      if (!sig) {
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }

      let event;
      try {
        event = getStripe().webhooks.constructEvent(
          req.rawBody as Buffer,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).json({ error: "Invalid signature" });
      }

      // Handle checkout.session.completed event
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const metadata = session.metadata as PaymentMetadata | undefined;

        if (metadata?.userId && metadata?.planType) {
          // Update user's plan in database
          await db
            .update(users)
            .set({
              plan: metadata.planType,
              planStartedAt: new Date(),
              planExpiresAt: metadata.planType === "PRO_MONTHLY"
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days
            })
            .where(eq(users.id, metadata.userId));

          console.log(`✅ User ${metadata.userId} upgraded to ${metadata.planType}`);
        }
      }

      // Handle customer.subscription.deleted event (if user cancels)
      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as any;
        // Optionally handle subscription cancellation here
        console.log(`Subscription deleted: ${subscription.id}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get billing status (optional utility endpoint)
  app.get("/api/billing/status", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user.id));

      if (!userResult.length) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = userResult[0];
      res.json({
        plan: user.plan,
        planStartedAt: user.planStartedAt,
        planExpiresAt: user.planExpiresAt,
        isActive: user.plan !== "FREE",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
