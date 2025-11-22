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
    <footer className="bg-background border-t border-border mt-12">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-semibold mb-2">About IWRITE</h3>
            <p className="text-sm text-muted-foreground">{brandLine}</p>
            <p className="text-xs text-muted-foreground mt-2">
              © {currentYear} {company}. All rights reserved.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-2">Product</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/plans" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-2">Legal</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/legal/imprint" className="text-muted-foreground hover:text-foreground transition-colors">
                  Imprint
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/legal/payment" className="text-muted-foreground hover:text-foreground transition-colors">
                  Payment Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>IWRITE – AI-Powered Document Writing Workspace</p>
          {companyInfo?.email && (
            <a 
              href={`mailto:${companyInfo.email}`}
              className="hover:text-foreground transition-colors"
            >
              {companyInfo.email}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
