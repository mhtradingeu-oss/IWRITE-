import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Layout, Zap, ArrowRight, Check } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const translations = {
  en: {
    upgradeToUnlock: "Unlock Premium Features",
    subtitle: "Get unlimited access to advanced tools for professional content creation",
    currentPlan: "You're on the FREE plan",
    description: "Upgrade to PRO and unlock all premium features",
    
    // Feature cards
    songwriterTitle: "Songwriter",
    songwriterDesc: "Create and refine song lyrics with AI assistance. Generate perfect lyrics for any mood, genre, or language.",
    songwriterFeatures: [
      "AI-powered lyric generation",
      "Multiple language support (Arabic, German, English)",
      "Custom song structures",
      "Rhyme pattern control",
      "Professional quality output",
    ],
    
    templatesTitle: "Professional Templates",
    templatesDesc: "Design professional templates for documents, emails, and marketing content with advanced customization.",
    templatesFeatures: [
      "Customizable headers & footers",
      "Logo and branding integration",
      "Advanced typography controls",
      "Color customization",
      "Save and reuse templates",
    ],
    
    // Benefits
    benefitsTitle: "Why Upgrade?",
    benefit1: "Create unlimited AI-powered content",
    benefit2: "Access all premium tools and features",
    benefit3: "Priority support",
    benefit4: "Professional quality outputs",
    
    // Pricing
    priceTitle: "PRO Plan",
    price: "€14.99",
    period: "per month",
    features: [
      "Everything in Free",
      "Unlimited AI operations",
      "Songwriter & Templates",
      "Style profiles",
      "Priority support",
    ],
    
    upgradeButton: "Upgrade Now",
    backButton: "Back to Dashboard",
  },
  de: {
    upgradeToUnlock: "Premium-Funktionen freischalten",
    subtitle: "Erhalten Sie unbegrenzten Zugriff auf erweiterte Tools zur professionellen Inhaltserstellung",
    currentPlan: "Sie nutzen den kostenlosen Plan",
    description: "Upgraden Sie auf PRO und schalten Sie alle Premium-Funktionen frei",
    
    // Feature cards
    songwriterTitle: "Songwriter",
    songwriterDesc: "Erstellen und verfeinern Sie Songtexte mit KI-Unterstützung. Generieren Sie perfekte Texte für jede Stimmung, jedes Genre oder jede Sprache.",
    songwriterFeatures: [
      "KI-gestützte Texterstellung",
      "Mehrsprachige Unterstützung (Arabisch, Deutsch, Englisch)",
      "Benutzerdefinierte Songstrukturen",
      "Reimschema-Kontrolle",
      "Professionelle Qualität",
    ],
    
    templatesTitle: "Professionelle Vorlagen",
    templatesDesc: "Entwerfen Sie professionelle Vorlagen für Dokumente, E-Mails und Marketing-Inhalte mit erweiterten Anpassungsmöglichkeiten.",
    templatesFeatures: [
      "Anpassbare Kopf- und Fußzeilen",
      "Logo- und Branding-Integration",
      "Erweiterte Typografie-Kontrolle",
      "Farbanpassung",
      "Vorlagen speichern und wiederverwenden",
    ],
    
    // Benefits
    benefitsTitle: "Warum upgraden?",
    benefit1: "Erstellen Sie unbegrenzte KI-gestützte Inhalte",
    benefit2: "Zugriff auf alle Premium-Tools und -Funktionen",
    benefit3: "Vorrangiger Support",
    benefit4: "Professionelle Qualitätsergebnisse",
    
    // Pricing
    priceTitle: "PRO Plan",
    price: "€14.99",
    period: "pro Monat",
    features: [
      "Alles im kostenlosen Plan",
      "Unbegrenzte KI-Operationen",
      "Songwriter & Vorlagen",
      "Stilprofile",
      "Vorrangiger Support",
    ],
    
    upgradeButton: "Jetzt upgraden",
    backButton: "Zurück zum Dashboard",
  },
  ar: {
    upgradeToUnlock: "فتح الميزات المميزة",
    subtitle: "احصل على وصول غير محدود إلى أدوات متقدمة لإنشاء محتوى احترافي",
    currentPlan: "أنت على الخطة المجانية",
    description: "ترقية إلى PRO وفتح جميع الميزات المميزة",
    
    // Feature cards
    songwriterTitle: "كاتب الأغاني",
    songwriterDesc: "إنشاء وتحسين كلمات الأغنية بمساعدة الذكاء الاصطناعي. توليد كلمات مثالية لأي حالة مزاجية أو نوع أو لغة.",
    songwriterFeatures: [
      "توليد كلمات يعتمد على الذكاء الاصطناعي",
      "دعم لغات متعددة (العربية والألمانية والإنجليزية)",
      "هياكل الأغاني المخصصة",
      "التحكم في نمط القافية",
      "إخراج عالي الجودة احترافي",
    ],
    
    templatesTitle: "القوالب الاحترافية",
    templatesDesc: "صمم قوالب احترافية للمستندات والرسائل الإلكترونية ومحتوى التسويق مع خيارات تخصيص متقدمة.",
    templatesFeatures: [
      "رؤوس وتذييلات قابلة للتخصيص",
      "تكامل الشعار والعلامات التجارية",
      "التحكم المتقدم في الطباعة",
      "تخصيص الألوان",
      "حفظ واستخدام القوالب مجددًا",
    ],
    
    // Benefits
    benefitsTitle: "لماذا الترقية؟",
    benefit1: "إنشاء محتوى غير محدود يعتمد على الذكاء الاصطناعي",
    benefit2: "الوصول إلى جميع الأدوات والميزات المميزة",
    benefit3: "دعم ذو أولوية",
    benefit4: "مخرجات عالية الجودة احترافية",
    
    // Pricing
    priceTitle: "خطة PRO",
    price: "€14.99",
    period: "في الشهر",
    features: [
      "كل شيء في الخطة المجانية",
      "عمليات ذكاء اصطناعي غير محدودة",
      "كاتب الأغاني والقوالب",
      "ملفات تعريف الأسلوب",
      "دعم ذو أولوية",
    ],
    
    upgradeButton: "ترقية الآن",
    backButton: "العودة إلى لوحة التحكم",
  },
};

export default function Upgrade() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const isRTL = language === "ar";

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-muted py-12 px-4 ${isRTL ? "rtl" : ""}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 ${isRTL ? "text-right" : "text-left"}`}>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {t.upgradeToUnlock}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            {t.subtitle}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="text-base">{t.currentPlan}</Badge>
            <Badge variant="outline" className="text-base">5 AI/day limit</Badge>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Songwriter Card */}
          <Card className="p-8 flex flex-col hover-elevate">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Music className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{t.songwriterTitle}</h3>
                <p className="text-muted-foreground mt-1">{t.songwriterDesc}</p>
              </div>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {t.songwriterFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/plans")}
              data-testid="button-upgrade-songwriter"
            >
              Unlock Songwriter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Templates Card */}
          <Card className="p-8 flex flex-col hover-elevate">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Layout className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{t.templatesTitle}</h3>
                <p className="text-muted-foreground mt-1">{t.templatesDesc}</p>
              </div>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {t.templatesFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/plans")}
              data-testid="button-upgrade-templates"
            >
              Unlock Templates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mb-12 p-8 bg-muted/50 rounded-lg border border-border">
          <h2 className="text-2xl font-bold mb-6">{t.benefitsTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[t.benefit1, t.benefit2, t.benefit3, t.benefit4].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Card */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold mb-2">{t.priceTitle}</h3>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold">{t.price}</span>
              <span className="text-muted-foreground">{t.period}</span>
            </div>
          </div>
          <ul className="space-y-3 mb-8">
            {t.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate("/plans")}
            data-testid="button-upgrade-now"
          >
            {t.upgradeButton}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            data-testid="button-back-dashboard"
          >
            {t.backButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
