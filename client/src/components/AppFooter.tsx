import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Mail } from "lucide-react";

interface CompanyInfo {
  name: string;
  brandLine: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
}

export function AppFooter() {
  const { data: companyInfo } = useQuery({
    queryKey: ["/api/public/company-info"],
    queryFn: async () => {
      const response = await fetch("/api/public/company-info");
      if (!response.ok) return null;
      return response.json();
    },
  });

  const currentYear = new Date().getFullYear();
  const company = companyInfo?.name || "MH Trading GmbH";
  const brandLine = companyInfo?.brandLine || "Developed by Crew Art · Powered by MH Trading GmbH";

  const productLinks = [
    { label: "Dashboard", href: "/dashboard", testid: "footer-link-dashboard" },
    { label: "Pricing", href: "/plans", testid: "footer-link-plans" },
    { label: "Settings", href: "/settings", testid: "footer-link-settings" },
  ];

  const legalLinks = [
    { label: "Imprint", href: "/legal/imprint", testid: "footer-link-imprint" },
    { label: "Privacy Policy", href: "/legal/privacy", testid: "footer-link-privacy" },
    { label: "Terms of Use", href: "/legal/terms", testid: "footer-link-terms" },
    { label: "Payment Policy", href: "/legal/payment", testid: "footer-link-payment" },
  ];

  return (
    <footer className="bg-background border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand Section - Left Side */}
          <div className="md:col-span-4 flex flex-col justify-start">
            <div className="mb-6">
              <h3 className="text-2xl font-bold tracking-tight mb-2">IWRITE</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {brandLine}
              </p>
            </div>
            
            <div className="space-y-3">
              {companyInfo?.email && (
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="footer-link-email"
                >
                  <Mail className="h-4 w-4" />
                  <span>{companyInfo.email}</span>
                </a>
              )}
              {companyInfo?.phone && (
                <p className="text-sm text-muted-foreground">
                  {companyInfo.phone}
                </p>
              )}
            </div>
          </div>

          {/* Product Section */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    data-testid={link.testid}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    data-testid={link.testid}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Support
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Contact us for support, billing inquiries, or feedback.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/40 mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright & Company */}
          <div className="text-xs text-muted-foreground text-center md:text-left">
            <p className="mb-1">
              © {currentYear} <span className="font-semibold">{company}</span>. All rights reserved.
            </p>
            <p>IWRITE – AI-Powered Document Writing Workspace</p>
          </div>

          {/* Credits */}
          <div className="text-xs text-muted-foreground text-center">
            <p>
              Developed by <span className="font-medium">Crew Art</span> · Powered by <span className="font-medium">{company}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
