import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    period: "",
    description: "For getting started",
    features: [
      "5 AI generations per month",
      "1 style profile",
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

  const upgradeMutation = useMutation({
    mutationFn: async (plan: string) => {
      const response = await fetch("/auth/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to upgrade");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
      toast({
        title: "Success",
        description: "Plan updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update plan",
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`p-8 flex flex-col ${
              plan.id === user?.plan ? "ring-2 ring-primary" : ""
            }`}
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
              onClick={() => upgradeMutation.mutate(plan.id)}
              data-testid={`button-select-plan-${plan.id}`}
            >
              {plan.id === user?.plan ? "Current Plan" : "Select Plan"}
            </Button>

            <div className="space-y-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
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
          You are on the <strong>{user?.plan}</strong> plan
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          ℹ️ Payment integration coming soon. For now, use admin tools to manage plans.
        </p>
      </div>
    </div>
  );
}
