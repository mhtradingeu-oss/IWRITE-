import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "./LanguageProvider";

const navItems = {
  en: [
    { label: "Product", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ],
  de: [
    { label: "Produkt", href: "#features" },
    { label: "Preise", href: "#pricing" },
  ],
  ar: [
    { label: "المنتج", href: "#features" },
    { label: "الأسعار", href: "#pricing" },
  ],
};

const loginLabels = {
  en: "Login",
  de: "Anmelden",
  ar: "تسجيل الدخول",
};

export function HomeHeader() {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const items = navItems[language as keyof typeof navItems] || navItems.en;
  const loginLabel = loginLabels[language as keyof typeof loginLabels] || loginLabels.en;
  const isRTL = language === "ar";

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${isRTL ? "rtl" : ""}`}>
      <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center ${isRTL ? "flex-row-reverse" : ""} justify-between`}>
        {/* Logo */}
        <div 
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
          data-testid="button-home-logo"
        >
          IWRITE
        </div>

        {/* Nav Items */}
        <div className="hidden sm:flex items-center gap-8">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-language-selector">
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setLanguage("en")}
                className={language === "en" ? "bg-accent" : ""}
                data-testid="option-language-en"
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage("ar")}
                className={language === "ar" ? "bg-accent" : ""}
                data-testid="option-language-ar"
              >
                العربية
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage("de")}
                className={language === "de" ? "bg-accent" : ""}
                data-testid="option-language-de"
              >
                Deutsch
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          <Button
            onClick={() => navigate("/login")}
            data-testid="button-home-header-cta"
            className="hidden sm:inline-flex"
          >
            {loginLabel}
          </Button>
        </div>
      </div>
    </header>
  );
}
