import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/LanguageProvider";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Mail, CreditCard, Zap, Calendar, Shield, ArrowRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

const translations = {
  en: {
    settings: "Account Settings",
    accountInfo: "Account Information",
    subscriptionBilling: "Subscription & Billing",
    usageStatistics: "Usage Statistics",
    accountManagement: "Account Management",
    basicInfo: "Basic Information",
    completeInfo: "Complete Details",
    email: "Email",
    accountCreated: "Account Created",
    currentPlan: "Current Plan",
    planStatus: "Plan Status",
    planType: "Plan Type",
    nextRenewal: "Next Renewal",
    features: "Features",
    dailyUsage: "Daily Usage",
    usageLimit: "Daily Limit",
    usageRemaining: "Remaining Today",
    usageToday: "Used Today",
    usagePercent: "Usage Percentage",
    free: "FREE",
    pro: "PRO",
    unlimited: "Unlimited",
    active: "Active",
    limited: "Limited",
    unlimited2: "Unlimited",
    genCount: "AI Generations per day",
    templateCount: "Unlimited Templates",
    styleCount: "Unlimited Style Profiles",
    uploadCount: "Unlimited File Uploads",
    exportCount: "Unlimited Exports",
    upgradeNote: "Upgrade to PRO for unlimited daily AI usage",
    logout: "Log Out",
    logoutDesc: "Sign out from your account",
    noData: "Unable to load user information",
    joinedOn: "Joined on",
    lastUsed: "Last used",
    resetDaily: "Resets at midnight UTC",
    usageInfo: "AI generation features (document generation, rewrites, translations, QA checks)",
  },
  ar: {
    settings: "إعدادات الحساب",
    accountInfo: "معلومات الحساب",
    subscriptionBilling: "الاشتراك والفواتير",
    usageStatistics: "إحصائيات الاستخدام",
    accountManagement: "إدارة الحساب",
    basicInfo: "المعلومات الأساسية",
    completeInfo: "التفاصيل الكاملة",
    email: "البريد الإلكتروني",
    accountCreated: "تم إنشاء الحساب",
    currentPlan: "الخطة الحالية",
    planStatus: "حالة الخطة",
    planType: "نوع الخطة",
    nextRenewal: "التجديد التالي",
    features: "الميزات",
    dailyUsage: "الاستخدام اليومي",
    usageLimit: "الحد اليومي",
    usageRemaining: "المتبقي اليوم",
    usageToday: "مستخدم اليوم",
    usagePercent: "نسبة الاستخدام",
    free: "مجاني",
    pro: "احترافي",
    unlimited: "غير محدود",
    active: "نشط",
    limited: "محدود",
    unlimited2: "غير محدود",
    genCount: "الأجيال الذكية في اليوم",
    templateCount: "قوالب غير محدودة",
    styleCount: "ملفات أنماط غير محدودة",
    uploadCount: "عمليات تحميل ملفات غير محدودة",
    exportCount: "عمليات تصدير غير محدودة",
    upgradeNote: "قم بالترقية إلى PRO للحصول على استخدام ذكي غير محدود",
    logout: "تسجيل الخروج",
    logoutDesc: "تسجيل الخروج من حسابك",
    noData: "لم يتمكن من تحميل معلومات المستخدم",
    joinedOn: "انضم في",
    lastUsed: "آخر استخدام",
    resetDaily: "إعادة تعيين في منتصف الليل بتوقيت UTC",
    usageInfo: "ميزات توليد الذكاء الاصطناعي (توليد المستندات وإعادة الكتابة والترجمة وفحوصات الجودة)",
  },
  de: {
    settings: "Kontoeinstellungen",
    accountInfo: "Kontoinformationen",
    subscriptionBilling: "Abonnement & Abrechnung",
    usageStatistics: "Nutzungsstatistiken",
    accountManagement: "Kontoverwaltung",
    basicInfo: "Grundinformationen",
    completeInfo: "Vollständige Details",
    email: "E-Mail",
    accountCreated: "Konto erstellt",
    currentPlan: "Aktueller Plan",
    planStatus: "Planstatus",
    planType: "Plantyp",
    nextRenewal: "Nächste Verlängerung",
    features: "Funktionen",
    dailyUsage: "Tägliche Nutzung",
    usageLimit: "Tägliches Limit",
    usageRemaining: "Heute verbleibend",
    usageToday: "Heute verwendet",
    usagePercent: "Nutzungsprozentsatz",
    free: "KOSTENLOS",
    pro: "PRO",
    unlimited: "Unbegrenzt",
    active: "Aktiv",
    limited: "Begrenzt",
    unlimited2: "Unbegrenzt",
    genCount: "KI-Generationen pro Tag",
    templateCount: "Unbegrenzte Vorlagen",
    styleCount: "Unbegrenzte Stilprofile",
    uploadCount: "Unbegrenzte Datei-Uploads",
    exportCount: "Unbegrenzte Exporte",
    upgradeNote: "Führen Sie ein Upgrade auf PRO durch, um unbegrenzte tägliche KI-Nutzung zu erhalten",
    logout: "Abmelden",
    logoutDesc: "Melden Sie sich von Ihrem Konto ab",
    noData: "Benutzerdaten konnten nicht geladen werden",
    joinedOn: "Beigetreten am",
    lastUsed: "Zuletzt verwendet",
    resetDaily: "Setzt sich täglich um Mitternacht UTC zurück",
    usageInfo: "KI-Generierungsfunktionen (Dokumentenerzeugung, Umschreiben, Übersetzung, QA-Checks)",
  },
};

const FREE_DAILY_LIMIT = 5;

interface User {
  id: string;
  email: string;
  plan: string;
  dailyUsageCount: number;
  dailyUsageDate?: string;
  createdAt?: string;
}

export default function Settings() {
  const { language } = useLanguage();
  const t = translations[language];
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      const response = await fetch("/auth/me", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch user");
      const data = await response.json();
      return data.user;
    },
  });

  const handleLogout = async () => {
    await fetch("/auth/logout", { method: "POST", credentials: "include" });
    navigate("/");
  };

  const upgradeMutation = useMutation({
    mutationFn: async (planType: "monthly" | "yearly") => {
      const response = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to start upgrade process",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Loading...</h1>
          </div>
          <div className="grid gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">{t.settings}</h1>
          <p className="text-muted-foreground">{t.noData}</p>
        </div>
      </div>
    );
  }

  const isFree = user.plan === "FREE";
  const isPro = !isFree;
  const usageCount = user.dailyUsageCount || 0;
  const usageRemaining = Math.max(0, FREE_DAILY_LIMIT - usageCount);
  const usagePercent = isFree ? Math.round((usageCount / FREE_DAILY_LIMIT) * 100) : 0;

  const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString(language) : "N/A";

  return (
    <div className="p-6 bg-background">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-settings-title">
            {t.settings}
          </h1>
          <p className="text-muted-foreground">Manage your account, subscription, and preferences</p>
        </div>

        {/* Quick Summary Card */}
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20" data-testid="card-summary">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t.planType}</p>
                <p className="text-lg font-bold" data-testid="text-plan-summary">
                  {isFree ? t.free : t.pro}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t.planStatus}</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{t.active}</p>
              </div>
              {isFree && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t.usageToday}</p>
                  <p className="text-lg font-bold" data-testid="text-usage-summary">
                    {usageCount}/{FREE_DAILY_LIMIT}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t.joinedOn}</p>
                <p className="text-sm font-semibold">{createdDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {/* ACCOUNT INFORMATION SECTION */}
          <Card data-testid="card-account-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {t.accountInfo}
              </CardTitle>
              <CardDescription>{t.basicInfo}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="border-b pb-4 last:border-b-0">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t.email}
                </label>
                <p className="text-base mt-2 font-medium" data-testid="text-email">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Primary account email</p>
              </div>

              {/* Account Created */}
              <div className="border-b pb-4 last:border-b-0">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t.accountCreated}
                </label>
                <p className="text-base mt-2 font-medium" data-testid="text-created-date">
                  {createdDate}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t.joinedOn}</p>
              </div>

              {/* Account ID (Complete Info) */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Account ID
                </label>
                <p className="text-sm mt-2 font-mono text-muted-foreground break-all" data-testid="text-account-id">
                  {user.id}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Unique identifier for your account</p>
              </div>
            </CardContent>
          </Card>

          {/* SUBSCRIPTION & BILLING SECTION */}
          <Card data-testid="card-subscription">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t.subscriptionBilling}
              </CardTitle>
              <CardDescription>{t.completeInfo}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Type */}
              <div className="border-b pb-4 last:border-b-0">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t.currentPlan}
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-2xl font-bold" data-testid="text-plan-detail">
                    {isFree ? t.free : t.pro}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isFree ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  }`}>
                    {isFree ? t.limited : t.unlimited2}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
                  {t.features}
                </label>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Zap className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{t.genCount}</p>
                      <p className="text-xs text-muted-foreground">
                        {isFree ? `${FREE_DAILY_LIMIT} per day` : t.unlimited}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{t.templateCount}</p>
                      <p className="text-xs text-muted-foreground">{t.unlimited}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{t.styleCount}</p>
                      <p className="text-xs text-muted-foreground">{t.unlimited}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{t.uploadCount}</p>
                      <p className="text-xs text-muted-foreground">{t.unlimited}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade Banner for FREE users */}
              {isFree && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">{t.upgradeNote}</p>
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      Get unlimited AI generations, priority support, and more with PRO.
                    </p>
                  </div>
                  <Button
                    onClick={() => upgradeMutation.mutate("monthly")}
                    disabled={upgradeMutation.isPending}
                    className="w-full gap-2"
                    data-testid="button-upgrade-to-pro"
                  >
                    {upgradeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                    Upgrade to PRO Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* USAGE STATISTICS SECTION */}
          {isFree && (
            <Card data-testid="card-usage">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {t.usageStatistics}
                </CardTitle>
                <CardDescription>Your daily AI generation usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Usage Progress */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">{t.dailyUsage}</span>
                    <span className="text-sm font-bold" data-testid="text-usage-percent">
                      {usagePercent}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                      style={{ width: `${usagePercent}%` }}
                      data-testid="progress-usage"
                    />
                  </div>
                </div>

                {/* Usage Details Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{t.usageToday}</p>
                    <p className="text-lg font-bold" data-testid="text-usage-count">
                      {usageCount}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{t.usageLimit}</p>
                    <p className="text-lg font-bold">{FREE_DAILY_LIMIT}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{t.usageRemaining}</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{usageRemaining}</p>
                  </div>
                </div>

                {/* Info Text */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    <span className="font-semibold block mb-1">📊 {t.usageInfo}</span>
                    {t.resetDaily}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ACCOUNT MANAGEMENT SECTION */}
          <Card data-testid="card-account-mgmt">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t.accountManagement}
              </CardTitle>
              <CardDescription>Manage your account access and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full sm:w-auto"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t.logout}
              </Button>
              <p className="text-xs text-muted-foreground">{t.logoutDesc}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
