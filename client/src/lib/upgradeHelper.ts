import { queryClient } from "./queryClient";

export type UpgradeState = "idle" | "loading" | "not-configured" | "success" | "error";

export interface UpgradeResult {
  state: UpgradeState;
  error?: string;
  url?: string;
}

export async function startUpgrade(planType: "monthly" | "yearly"): Promise<UpgradeResult> {
  try {
    const response = await fetch("/api/billing/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planType }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 503 || data.error === "Stripe not configured") {
        return { state: "not-configured", error: "Stripe is not configured. Please contact the administrator." };
      }
      return { state: "error", error: data.error || "Failed to start upgrade" };
    }

    if (data.url) {
      // Invalidate cache before redirecting
      queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
      // Redirect to Stripe checkout
      window.location.href = data.url;
      return { state: "success", url: data.url };
    }

    return { state: "error", error: "No checkout URL received" };
  } catch (error: any) {
    return { state: "error", error: error.message || "Network error" };
  }
}
