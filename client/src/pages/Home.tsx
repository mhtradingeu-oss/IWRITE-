import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/LanguageProvider";
import { AppFooter } from "@/components/AppFooter";
import { HomeHeader } from "@/components/HomeHeader";
import { Zap, FileText, Music, Layout, Search, Check, ArrowRight } from "lucide-react";

const translations = {
  en: {
    hero: {
      title: "IWRITE",
      subtitle: "AI-Powered Document Workspace",
      description: "Create professional documents, contracts, and multilingual content with German compliance, Arabic/German/English support.",
      cta1: "Open Workspace",
      cta2: "View Pricing",
    },
    features: {
      title: "Key Features",
      items: [
        {
          name: "AI Writer",
          description: "Generate documents, contracts, and policies with intelligent suggestions",
          icon: "FileText",
        },
        {
          name: "Songwriter",
          description: "Create lyrics and musical content with AI assistance",
          icon: "Music",
        },
        {
          name: "Templates",
          description: "Professional templates for contracts, policies, and marketing copy",
          icon: "Layout",
        },
        {
          name: "Topics & Search",
          description: "Organize and search across your knowledge base effortlessly",
          icon: "Search",
        },
        {
          name: "Style Profiles",
          description: "Maintain consistent tone and style across all documents",
          icon: "Zap",
        },
        {
          name: "Quality Checks",
          description: "Built-in QA checks for medical claims, compliance, and consistency",
          icon: "Check",
        },
      ],
    },
    languages: {
      title: "Full Multilingual Support",
      description: "Seamlessly create professional content in multiple languages with native support for:",
      arabic: "Arabic (RTL) – Marketing, contracts, policies, e-commerce",
      german: "German – Legal documents, terms, privacy, product descriptions",
      english: "English – Global documentation, policies, marketing copy",
    },
    compliance: {
      title: "Compliance & Quality",
      description: "Built for regulated industries with quality assurance and professional standards",
      items: [
        "Medical claim verification",
        "Template-based compliance checks",
        "Audit trail and version history",
        "Legal template library",
        "Multilingual support for German market",
      ],
    },
    company: {
      title: "Trusted by Professionals",
      description: "Powered by MH Trading GmbH, developed by Crew Art",
      location: "Polierweg 39, 12351 Berlin, Germany",
      commitment: "A German company committed to data security, compliance, and professional excellence.",
    },
    pricing: {
      title: "Plans for Every Need",
      free: {
        name: "Free",
        price: "€0",
        period: "Forever",
        description: "Perfect for getting started",
        limit: "5 AI operations per day",
        features: ["Dashboard access", "AI Writer", "Basic templates", "Document management"],
        cta: "Start Free",
      },
      pro: {
        name: "Pro",
        price: "€14.99",
        period: "per month",
        description: "For professional teams",
        limit: "Unlimited AI operations",
        features: ["Everything in Free", "Unlimited AI usage", "Priority support", "Advanced templates", "Style profiles"],
        cta: "Upgrade to Pro",
      },
    },
    cta: {
      title: "Start Writing with IWRITE Today",
      description: "Join professionals creating better documents faster",
      button: "Open Workspace",
    },
  },
  de: {
    hero: {
      title: "IWRITE",
      subtitle: "KI-gestützter Dokumentenarbeitsplatz",
      description: "Erstellen Sie professionelle Dokumente, Verträge und mehrsprachige Inhalte mit deutscher Compliance und Unterstützung für Arabisch/Deutsch/Englisch.",
      cta1: "Arbeitsbereich öffnen",
      cta2: "Preise anzeigen",
    },
    features: {
      title: "Hauptfunktionen",
      items: [
        {
          name: "KI-Schreiber",
          description: "Generieren Sie Dokumente, Verträge und Richtlinien mit intelligenten Vorschlägen",
          icon: "FileText",
        },
        {
          name: "Songwriter",
          description: "Erstellen Sie Liedtexte und musikalische Inhalte mit KI-Unterstützung",
          icon: "Music",
        },
        {
          name: "Vorlagen",
          description: "Professionelle Vorlagen für Verträge, Richtlinien und Marketing-Texte",
          icon: "Layout",
        },
        {
          name: "Themen & Suche",
          description: "Organisieren und durchsuchen Sie Ihre Wissensdatenbank mühelos",
          icon: "Search",
        },
        {
          name: "Stilprofile",
          description: "Behalten Sie einen konsistenten Ton und Stil über alle Dokumente hinweg",
          icon: "Zap",
        },
        {
          name: "Qualitätsprüfung",
          description: "Integrierte QA-Checks für medizinische Aussagen, Compliance und Konsistenz",
          icon: "Check",
        },
      ],
    },
    languages: {
      title: "Vollständige mehrsprachige Unterstützung",
      description: "Erstellen Sie problemlos professionelle Inhalte in mehreren Sprachen mit nativer Unterstützung für:",
      arabic: "Arabisch (RTL) – Marketing, Verträge, Richtlinien, E-Commerce",
      german: "Deutsch – Rechtsdokumente, AGB, Datenschutz, Produktbeschreibungen",
      english: "Englisch – Globale Dokumentation, Richtlinien, Marketing-Texte",
    },
    compliance: {
      title: "Compliance & Qualität",
      description: "Entwickelt für regulierte Branchen mit Qualitätssicherung und professionellen Standards",
      items: [
        "Medizinische Anspruchsprüfung",
        "Template-basierte Compliance-Prüfungen",
        "Audit-Trail und Versionsverlauf",
        "Juridische Vorlagenbibliothek",
        "Mehrsprachige Unterstützung für deutsche Märkte",
      ],
    },
    company: {
      title: "Vertraut von Fachleuten",
      description: "Angetrieben von MH Trading GmbH, entwickelt von Crew Art",
      location: "Polierweg 39, 12351 Berlin, Deutschland",
      commitment: "Ein deutsches Unternehmen, das sich der Datensicherheit, Compliance und professionellen Excellence widmet.",
    },
    pricing: {
      title: "Pläne für jeden Bedarf",
      free: {
        name: "Kostenlos",
        price: "€0",
        period: "Immer",
        description: "Perfekt zum Starten",
        limit: "5 KI-Operationen pro Tag",
        features: ["Dashboard-Zugriff", "KI-Schreiber", "Grundvorlagen", "Dokumentverwaltung"],
        cta: "Kostenlos starten",
      },
      pro: {
        name: "Pro",
        price: "€14,99",
        period: "pro Monat",
        description: "Für professionelle Teams",
        limit: "Unbegrenzte KI-Operationen",
        features: ["Alles aus Free", "Unbegrenzte KI-Nutzung", "Prioritätssupport", "Erweiterte Vorlagen", "Stilprofile"],
        cta: "Upgrade zu Pro",
      },
    },
    cta: {
      title: "Beginnen Sie heute mit IWRITE",
      description: "Treten Sie Fachleuten bei, die bessere Dokumente schneller erstellen",
      button: "Arbeitsbereich öffnen",
    },
  },
  ar: {
    hero: {
      title: "IWRITE",
      subtitle: "مساحة عمل وثائق بالذكاء الاصطناعي",
      description: "أنشئ مستندات احترافية وعقود ومحتوى متعدد اللغات مع الامتثال الألماني ودعم اللغة العربية والألمانية والإنجليزية.",
      cta1: "فتح مساحة العمل",
      cta2: "عرض الأسعار",
    },
    features: {
      title: "الميزات الرئيسية",
      items: [
        {
          name: "كاتب ذكي",
          description: "إنشاء مستندات وعقود وسياسات مع الاقتراحات الذكية",
          icon: "FileText",
        },
        {
          name: "كاتب الأغاني",
          description: "إنشاء كلمات وأغاني موسيقية بمساعدة الذكاء الاصطناعي",
          icon: "Music",
        },
        {
          name: "النماذج",
          description: "نماذج احترافية للعقود والسياسات والنصوص التسويقية",
          icon: "Layout",
        },
        {
          name: "المواضيع والبحث",
          description: "نظم وابحث في قاعدة معارفك بسهولة",
          icon: "Search",
        },
        {
          name: "ملفات النمط",
          description: "الحفاظ على نبرة وأسلوب متسقة عبر جميع المستندات",
          icon: "Zap",
        },
        {
          name: "فحوصات الجودة",
          description: "فحوصات مدمجة للمطالبات الطبية والامتثال والاتساق",
          icon: "Check",
        },
      ],
    },
    languages: {
      title: "دعم متعدد اللغات كامل",
      description: "أنشئ بسهولة محتوى احترافي بلغات متعددة مع الدعم الأصلي لـ:",
      arabic: "العربية (RTL) – التسويق والعقود والسياسات والتجارة الإلكترونية",
      german: "الألمانية – الوثائق القانونية والشروط والخصوصية ووصف المنتجات",
      english: "الإنجليزية – التوثيق العام والسياسات والنصوص التسويقية",
    },
    compliance: {
      title: "الامتثال والجودة",
      description: "مصمم للصناعات المنظمة مع ضمان الجودة والمعايير الاحترافية",
      items: [
        "التحقق من المطالبات الطبية",
        "فحوصات الامتثال القائمة على النماذج",
        "سجل التدقيق وسجل الإصدارات",
        "مكتبة النماذج القانونية",
        "الدعم متعدد اللغات للسوق الألماني",
      ],
    },
    company: {
      title: "موثوق من قبل المحترفين",
      description: "مدعوم من MH Trading GmbH، طورته شركة Crew Art",
      location: "Polierweg 39, 12351 Berlin, Germany",
      commitment: "شركة ألمانية ملتزمة بأمان البيانات والامتثال والتميز المهني.",
    },
    pricing: {
      title: "خطط لكل احتياج",
      free: {
        name: "مجاني",
        price: "€0",
        period: "للأبد",
        description: "مثالي للبدء",
        limit: "5 عمليات ذكاء اصطناعي يومياً",
        features: ["وصول لوحة التحكم", "كاتب ذكي", "نماذج أساسية", "إدارة المستندات"],
        cta: "ابدأ مجاناً",
      },
      pro: {
        name: "احترافي",
        price: "€14,99",
        period: "شهرياً",
        description: "للفرق الاحترافية",
        limit: "عمليات ذكاء اصطناعي غير محدودة",
        features: ["كل شيء من المجاني", "استخدام ذكاء اصطناعي غير محدود", "الدعم الأولوي", "نماذج متقدمة", "ملفات النمط"],
        cta: "الترقية إلى Pro",
      },
    },
    cta: {
      title: "ابدأ باستخدام IWRITE اليوم",
      description: "انضم إلى المحترفين الذين ينشئون مستندات أفضل بشكل أسرع",
      button: "فتح مساحة العمل",
    },
  },
};

const iconMap = {
  FileText,
  Music,
  Layout,
  Search,
  Zap,
  Check,
};

export default function Home() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const isRTL = language === "ar";

  return (
    <div className={`min-h-screen bg-background flex flex-col ${isRTL ? "rtl" : ""}`}>
      <HomeHeader />

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className={`w-full max-w-4xl text-center ${isRTL ? "text-right" : "text-left"}`}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            {t.hero.title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6">
            {t.hero.subtitle}
          </p>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              data-testid="button-home-cta-workspace"
              className="w-full sm:w-auto"
            >
              {t.hero.cta1}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              data-testid="button-home-cta-pricing"
              className="w-full sm:w-auto"
            >
              {t.hero.cta2}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-muted/30">
        <div className="w-full max-w-7xl mx-auto">
          <div className={`mb-12 ${isRTL ? "text-right" : "text-left"}`}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t.features.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.items.map((feature: any) => {
              const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
              return (
                <Card key={feature.name} className="p-6 flex flex-col h-full hover-elevate">
                  <div className="flex items-start gap-3 mb-4">
                    {IconComponent && <IconComponent className="h-6 w-6 text-primary flex-shrink-0 mt-1" />}
                    <h3 className="text-lg font-semibold">{feature.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    {feature.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 w-fit"
                    onClick={() => navigate("/dashboard")}
                    data-testid={`button-feature-${feature.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    Open in App →
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="w-full max-w-5xl mx-auto">
          <div className={`mb-12 ${isRTL ? "text-right" : "text-left"}`}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t.languages.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t.languages.description}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-6">
              <Badge className="mb-3">العربية</Badge>
              <p className="text-sm text-muted-foreground">
                {t.languages.arabic}
              </p>
            </Card>
            <Card className="p-6">
              <Badge className="mb-3">Deutsch</Badge>
              <p className="text-sm text-muted-foreground">
                {t.languages.german}
              </p>
            </Card>
            <Card className="p-6">
              <Badge className="mb-3">English</Badge>
              <p className="text-sm text-muted-foreground">
                {t.languages.english}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-muted/30">
        <div className="w-full max-w-5xl mx-auto">
          <div className={`mb-12 ${isRTL ? "text-right" : "text-left"}`}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t.compliance.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t.compliance.description}
            </p>
          </div>
          <ul className={`space-y-3 max-w-2xl ${isRTL ? "text-right" : "text-left"}`}>
            {t.compliance.items.map((item: string) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="w-full max-w-6xl mx-auto">
          <div className={`mb-12 ${isRTL ? "text-right" : "text-left"}`}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t.pricing.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[t.pricing.free, t.pricing.pro].map((plan: any) => (
              <Card key={plan.name} className="p-8 flex flex-col hover-elevate">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <Badge variant="secondary" className="mb-6 w-fit">{plan.limit}</Badge>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => navigate(plan.name === "Free" ? "/dashboard" : "/settings")}
                  data-testid={`button-pricing-${plan.name.toLowerCase()}`}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-muted/30">
        <div className="w-full max-w-4xl mx-auto">
          <div className={`${isRTL ? "text-right" : "text-left"}`}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t.company.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              {t.company.description}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {t.company.location}
            </p>
            <p className="text-base text-muted-foreground">
              {t.company.commitment}
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className={`w-full max-w-4xl mx-auto text-center ${isRTL ? "text-right" : "text-left"}`}>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t.cta.title}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t.cta.description}
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/dashboard")}
            data-testid="button-home-final-cta"
          >
            {t.cta.button}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <AppFooter />
    </div>
  );
}
