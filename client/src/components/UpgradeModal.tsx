import { Sparkles, Crown, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./LanguageProvider";

const translations = {
  en: {
    upgradeToPro: "Upgrade to PRO",
    proFeatures: "Get unlimited access to all premium features",
    featureList: [
      "Unlimited daily AI document generations",
      "Full access to Songwriter (lyrics generation)",
      "Create and manage unlimited templates",
      "Advanced style profiles and customization",
      "Priority support",
    ],
    upgradeToPlan: "Upgrade to PRO",
    learnMore: "Learn more about PRO",
    cancel: "Cancel",
  },
  ar: {
    upgradeToPro: "ترقية إلى PRO",
    proFeatures: "احصل على وصول غير محدود إلى جميع المميزات المتميزة",
    featureList: [
      "عمليات إنشاء مستندات ذكاء اصطناعي غير محدودة يومياً",
      "وصول كامل إلى Songwriter (توليد الكلمات)",
      "إنشاء وإدارة قوالب غير محدودة",
      "ملفات تعريف أسلوب متقدمة وتخصيص",
      "دعم أولوي",
    ],
    upgradeToPlan: "ترقية إلى PRO",
    learnMore: "تعرف على المزيد حول PRO",
    cancel: "إلغاء",
  },
  de: {
    upgradeToPro: "Upgrade zu PRO",
    proFeatures: "Erhalten Sie unbegrenzten Zugang zu allen Premium-Funktionen",
    featureList: [
      "Unbegrenzte tägliche KI-Dokumentgenerierungen",
      "Vollständiger Zugang zu Songwriter (Textgenerierung)",
      "Unbegrenzte Vorlagen erstellen und verwalten",
      "Erweiterte Stilprofile und Anpassung",
      "Prioritäts-Support",
    ],
    upgradeToPlan: "Upgrade zu PRO",
    learnMore: "Erfahren Sie mehr über PRO",
    cancel: "Abbrechen",
  },
};

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade?: () => void;
}

export function UpgradeModal({ open, onOpenChange, onUpgrade }: UpgradeModalProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-upgrade">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <DialogTitle>{t.upgradeToPro}</DialogTitle>
          </div>
          <DialogDescription>{t.proFeatures}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <ul className="space-y-3">
            {t.featureList.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            data-testid="button-upgrade-cancel"
          >
            {t.cancel}
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              onUpgrade?.();
              onOpenChange(false);
            }}
            data-testid="button-upgrade-confirm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {t.upgradeToPlan}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
