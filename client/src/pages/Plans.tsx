import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, AlertTriangle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/LanguageProvider";
import { startUpgrade } from "@/lib/upgradeHelper";

const translations = {
  en: {
    subscriptionPlans: "Subscription Plans",
    chooseThePlan: "Choose the plan that fits your needs",
    stripeNotConfigured: "Stripe payment processing is not currently configured. Demo access available – contact the administrator.",
    stripeConfigured: "Stripe payment integration is ready. Click 'Upgrade Now' to start your premium experience.",
    currentPlan: "Current Plan",
    youAreOn: "You are on the",
    plan: "plan",
    upgradNow: "Upgrade Now",
    currentPlanBtn: "Current Plan",
  },
  de: {
    subscriptionPlans: "Abonnementpläne",
    chooseThePlan: "Wählen Sie den Plan, der zu Ihnen passt",
    stripeNotConfigured: "Stripe-Zahlungsverarbeitung ist nicht konfiguriert. Demo-Zugang verfügbar – kontaktieren Sie den Administrator.",
    stripeConfigured: "Stripe-Zahlungsintegration ist bereit. Klicken Sie auf 'Jetzt upgraden', um Ihre Premium-Erfahrung zu starten.",
    currentPlan: "Aktueller Plan",
    youAreOn: "Sie nutzen den",
    plan: "Plan",
    upgradNow: "Jetzt upgraden",
    currentPlanBtn: "Aktueller Plan",
  },
  ar: {
    subscriptionPlans: "خطط الاشتراك",
    chooseThePlan: "اختر الخطة التي تناسب احتياجاتك",
    stripeNotConfigured: "معالجة الدفع عبر Stripe غير مكونة. الوصول التجريبي متاح – اتصل بالمسؤول.",
    stripeConfigured: "تكامل Stripe جاهز. انقر على 'الترقية الآن' لبدء تجربتك المميزة.",
    currentPlan: "الخطة الحالية",
    youAreOn: "أنت على",
    plan: "الخطة",
    upgradNow: "الترقية الآن",
    currentPlanBtn: "الخطة الحالية",
  },
};

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

const adminNotice = {
  title: "Administrator Account",
  description: "If your account has been granted admin access, you will have additional management capabilities. Admin accounts are not a subscription plan—they are special system accounts used to manage users, maintain the application, and oversee system settings. Admin access is assigned by the system owner.",
};

export default function Plans() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
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

  const [stripeConfigured, setStripeConfigured] = React.useState(true);

  const upgradeMutation = useMutation({
    mutationFn: async (planType: "monthly" | "yearly") => {
      const result = await startUpgrade(planType);
      if (result.state === "error" || result.state === "not-configured") {
        setStripeConfigured(false);
        throw new Error(result.error || "Stripe is not configured");
      }
      return result;
    },
    onError: (error: any) => {
      const message = error.message || "Failed to start upgrade process";
      if (message.includes("not configured") || message.includes("Stripe")) {
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
        <h1 className="text-4xl font-bold mb-2" data-testid="text-plans-title">{t.subscriptionPlans}</h1>
        <p className="text-lg text-muted-foreground">
          {t.chooseThePlan}
        </p>
      </div>

      {/* Stripe Configuration Status */}
      {!stripeConfigured && (
        <Alert className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-950/30">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            {t.stripeNotConfigured}
          </AlertDescription>
        </Alert>
      )}

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
              disabled={plan.id === user?.plan || upgradeMutation.isPending || (!stripeConfigured && plan.id !== "FREE")}
              data-testid={`button-select-plan-${plan.id}`}
              onClick={() => {
                if (plan.id === "FREE") return;
                const planType = plan.id === "PRO_MONTHLY" ? "monthly" : "yearly";
                upgradeMutation.mutate(planType);
              }}
            >
              {upgradeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {plan.id === user?.plan ? t.currentPlanBtn : plan.id === "FREE" ? "Free" : t.upgradNow}
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

      <div className="mt-12 space-y-6">
        <Card className="p-6 bg-muted/50">
          <div className="flex items-start gap-3 mb-3">
            <CreditCard className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">{t.currentPlan}</h3>
              <p className="text-muted-foreground">
                {t.youAreOn} <strong>{user?.plan || "FREE"}</strong> {t.plan}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {stripeConfigured ? `✓ ${t.stripeConfigured}` : `⚠ ${t.stripeNotConfigured}`}
              </p>
            </div>
          </div>
        </Card>

        {user?.role === "admin" && (
          <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <div>
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">🔑 {adminNotice.title}</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {adminNotice.description}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
