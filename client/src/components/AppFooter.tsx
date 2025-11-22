import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";

interface CompanyInfo {
  name: string;
  brandLine: string;
  email: string;
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

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-bold text-lg mb-2">IWRITE</h3>
            <p className="text-xs text-muted-foreground mb-3">{brandLine}</p>
            <p className="text-xs text-muted-foreground">
              © {currentYear} {company}.<br />All rights reserved.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-dashboard">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/plans" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-plans">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-settings">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/legal/imprint" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-imprint">
                  Imprint
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-privacy">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-terms">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/legal/payment" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-payment">
                  Payment Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Support</h4>
            {companyInfo?.email && (
              <a 
                href={`mailto:${companyInfo.email}`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors block mb-4"
                data-testid="footer-link-email"
              >
                {companyInfo.email}
              </a>
            )}
            <p className="text-xs text-muted-foreground">
              Contact us for support, billing inquiries, or feedback.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
          <p className="text-center sm:text-left">IWRITE – AI-Powered Document Writing Workspace</p>
          <p className="text-center">Made with ❤️ by Crew Art & MH Trading GmbH</p>
        </div>
      </div>
    </footer>
  );
}
