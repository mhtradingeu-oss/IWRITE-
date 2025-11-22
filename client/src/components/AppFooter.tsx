import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

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
  const email = companyInfo?.email || "contact@iwrite.ai";
  const addressLine1 = companyInfo?.addressLine1 || "Polierweg 39";
  const addressLine2 = companyInfo?.addressLine2 || "12351 Berlin, Germany";

  const productLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pricing", href: "/plans" },
    { label: "Settings", href: "/settings" },
  ];

  const legalLinks = [
    { label: "Imprint", href: "/legal/imprint" },
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
    { label: "Payment Policy", href: "/legal/payment" },
  ];

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Company Info */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-semibold text-foreground">IWRITE</h3>
            <p className="text-xs text-muted-foreground leading-snug">
              AI-powered document writing workspace for professionals.
            </p>
            <div className="pt-2 space-y-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{company}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {addressLine1}<br />{addressLine2}
              </p>
              <p className="text-xs text-muted-foreground">
                <a 
                  href={`mailto:${email}`}
                  className="text-primary hover:text-primary/80 transition-colors"
                  data-testid="footer-link-email"
                >
                  {email}
                </a>
              </p>
            </div>
          </div>

          {/* Product Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="h-px bg-border/50 mb-6" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {currentYear} {company}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made by <span className="font-medium">Crew Art</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
