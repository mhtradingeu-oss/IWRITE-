import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/LanguageProvider";

const translations = {
  en: {
    settings: "Account Settings",
    profile: "Profile",
    plan: "Plan & Usage",
    email: "Email",
    fullName: "Full Name",
    currentPlan: "Current Plan",
    usage: "Daily Usage",
    usageLimit: "Daily Limit",
    free: "FREE",
    pro: "PRO",
    unlimited: "Unlimited",
    upgradeNote: "Upgrade to PRO for unlimited daily usage",
  },
  ar: {
    settings: "إعدادات الحساب",
    profile: "الملف الشخصي",
    plan: "الخطة والاستخدام",
    email: "البريد الإلكتروني",
    fullName: "الاسم الكامل",
    currentPlan: "الخطة الحالية",
    usage: "الاستخدام اليومي",
    usageLimit: "حد الاستخدام اليومي",
    free: "مجاني",
    pro: "احترافي",
    unlimited: "غير محدود",
    upgradeNote: "قم بالترقية إلى PRO للحصول على استخدام يومي غير محدود",
  },
  de: {
    settings: "Kontoeinstellungen",
    profile: "Profil",
    plan: "Plan & Nutzung",
    email: "E-Mail",
    fullName: "Vollständiger Name",
    currentPlan: "Aktueller Plan",
    usage: "Tägliche Nutzung",
    usageLimit: "Tägliches Limit",
    free: "KOSTENLOS",
    pro: "PRO",
    unlimited: "Unbegrenzt",
    upgradeNote: "Upgrade zu PRO für unbegrenzte tägliche Nutzung",
  },
};

const FREE_DAILY_LIMIT = 5;

interface User {
  id: string;
  email: string;
  plan: string;
  dailyUsageCount: number;
  dailyUsageDate?: string;
}

export default function Settings() {
  const { language } = useLanguage();
  const t = translations[language];

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      const response = await fetch("/auth/me", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch user");
      const data = await response.json();
      return data.user;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Loading...</h1>
          </div>
          <Skeleton className="h-64 mb-4" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">{t.settings}</h1>
          <p className="text-muted-foreground">Unable to load user information</p>
        </div>
      </div>
    );
  }

  const isFree = user.plan === "FREE";
  const usagePercent = isFree ? Math.round((user.dailyUsageCount / FREE_DAILY_LIMIT) * 100) : 0;

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-settings-title">{t.settings}</h1>
          <p className="text-muted-foreground">Manage your account and subscription</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card data-testid="card-profile">
            <CardHeader>
              <CardTitle>{t.profile}</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t.email}</label>
                <p className="text-base mt-1" data-testid="text-email">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Plan & Usage Section */}
          <Card data-testid="card-plan">
            <CardHeader>
              <CardTitle>{t.plan}</CardTitle>
              <CardDescription>Your current subscription and usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t.currentPlan}</label>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold" data-testid="text-plan">
                    {isFree ? t.free : t.pro}
                  </span>
                  {isFree && (
                    <span className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                      {t.unlimited}
                    </span>
                  )}
                </div>
              </div>

              {isFree && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground">{t.usage}</label>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm" data-testid="text-usage-count">
                        {user.dailyUsageCount} / {FREE_DAILY_LIMIT}
                      </span>
                      <span className="text-xs text-muted-foreground">{usagePercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${usagePercent}%` }}
                        data-testid="progress-usage"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">{t.upgradeNote}</p>
                </div>
              )}

              {!isFree && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    You have unlimited daily usage with your {user.plan} subscription.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
