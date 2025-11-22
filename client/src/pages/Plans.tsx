import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startUpgrade } from "@/lib/upgradeHelper";

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    period: "",
    description: "For getting started",
    features: [
      "5 AI generations per day",
      "Unlimited templates",
      "Unlimited style profiles",
      "Basic export (MD/DOCX)",
      "Community support",
    ],
  },
  {
    id: "PRO_MONTHLY",
    name: "Pro Monthly",
    price: 14.99,
    period: "month",
    description: "Professional use",
    features: [
      "Unlimited AI generations",
      "Unlimited templates",
      "Unlimited style profiles",
      "All export formats",
      "Email support",
      "Advanced QA checks",
    ],
  },
  {
    id: "PRO_YEARLY",
    name: "Pro Yearly",
    price: 149.99,
    period: "year",
    description: "Best value (2 months free)",
    features: [
      "Unlimited AI generations",
      "Unlimited templates",
      "Unlimited style profiles",
      "All export formats",
      "Priority support",
      "Advanced QA checks",
      "Custom integrations",
    ],
  },
];

export default function Plans() {
  const { toast } = useToast();
  const { data: user } = useQuery({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      const response = await fetch("/auth/me", { credentials: "include" });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user;
    },
  });

  const [stripeNotConfigured, setStripeNotConfigured] = useQuery({
    queryKey: ["/api/billing/stripe-status"],
    queryFn: async () => {
      const response = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: "monthly" }),
        credentials: "include",
      });
      return response.status === 503;
    },
    enabled: false,
  });

  const upgradeMutation = useMutation({
    mutationFn: async (planType: "monthly" | "yearly") => {
      const result = await startUpgrade(planType);
      if (result.state === "error" || result.state === "not-configured") {
        throw new Error(result.error || "Failed to start upgrade");
      }
      return result;
    },
    onError: (error: any) => {
      const message = error.message || "Failed to start upgrade process";
      if (message.includes("not configured")) {
        // Don't show toast for Stripe not configured - it's handled in UI
        return;
      }
      toast({
        title: "Upgrade Failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-lg text-muted-foreground">
          Choose the plan that fits your needs
        </p>
      </div>

      {/* Stripe Not Configured Warning */}
      <Alert className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-950/30">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          Stripe payment processing is not currently configured. Please contact the administrator to set up billing.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`p-8 flex flex-col ${
              plan.id === user?.plan ? "ring-2 ring-primary" : ""
            }`}
            data-testid={`card-plan-${plan.id}`}
          >
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-muted-foreground mb-6">{plan.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold">${plan.price}</span>
              {plan.period && <span className="text-muted-foreground">/{plan.period}</span>}
            </div>

            <Button
              className="w-full mb-8"
              variant={plan.id === user?.plan ? "outline" : "default"}
              disabled={plan.id === user?.plan || upgradeMutation.isPending}
              data-testid={`button-select-plan-${plan.id}`}
              onClick={() => {
                if (plan.id === "FREE") return;
                const planType = plan.id === "PRO_MONTHLY" ? "monthly" : "yearly";
                upgradeMutation.mutate(planType);
              }}
            >
              {upgradeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {plan.id === user?.plan ? "Current Plan" : plan.id === "FREE" ? "Your Plan" : "Upgrade Now"}
            </Button>

            <div className="space-y-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">📝 Current Plan</h3>
        <p className="text-muted-foreground">
          You are on the <strong>{user?.plan || "FREE"}</strong> plan
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          ✓ Stripe payment integration is now active. Click "Upgrade Now" to start your premium experience.
        </p>
      </div>
    </div>
  );
}
