import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";

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
    <footer className="bg-background border-t border-border/40 mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        {/* Main Grid - Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 lg:gap-16 mb-16">
          
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-start">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">IWRITE</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {brandLine}
              </p>
            </div>
            
            <div className="space-y-3">
              {companyInfo?.email && (
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  data-testid="footer-link-email"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{companyInfo.email}</span>
                </a>
              )}
              {companyInfo?.phone && (
                <a
                  href={`tel:${companyInfo.phone}`}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  data-testid="footer-link-phone"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{companyInfo.phone}</span>
                </a>
              )}
              {(companyInfo?.addressLine1 || companyInfo?.addressLine2) && (
                <div className="inline-flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    {companyInfo?.addressLine1 && <p>{companyInfo.addressLine1}</p>}
                    {companyInfo?.addressLine2 && <p>{companyInfo.addressLine2}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Section */}
          <div className="flex flex-col">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Product
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 inline-block"
                    data-testid={link.testid}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div className="flex flex-col">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Legal
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 inline-block"
                    data-testid={link.testid}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div className="flex flex-col">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Support
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Contact us for support, billing inquiries, or feedback.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/40 mb-12" />

        {/* Bottom Section - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
          {/* Copyright & Company */}
          <div className="text-xs text-muted-foreground text-center sm:text-left order-2 sm:order-1">
            <p className="mb-1">
              © {currentYear} <span className="font-semibold">{company}</span>. All rights reserved.
            </p>
            <p className="text-xs">IWRITE – AI-Powered Document Writing Workspace</p>
          </div>

          {/* Credits */}
          <div className="text-xs text-muted-foreground text-center order-1 sm:order-2">
            <p>
              Developed by <span className="font-medium">Crew Art</span>
            </p>
            <p>
              Powered by <span className="font-medium">{company}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
