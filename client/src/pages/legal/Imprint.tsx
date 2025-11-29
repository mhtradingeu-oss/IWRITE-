import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyInfo {
  name: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
  email: string;
  regId: string;
  vatId: string;
}

export default function Imprint() {
  const { data: companyInfo } = useQuery({
    queryKey: ["/api/public/company-info"],
    queryFn: async () => {
      const response = await fetch("/api/public/company-info");
      if (!response.ok) return null;
      return response.json();
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Legal Notice / Imprint</h1>
        <p className="text-muted-foreground">Company information and legal details</p>
      </div>

      <div className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Official details of the operating entity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">{companyInfo?.name || "MH Trading GmbH"}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {companyInfo?.addressLine1 || "Street Address"}<br />
                {companyInfo?.addressLine2 || "City, Country"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Contact</p>
                <p className="text-sm mt-1">{companyInfo?.phone || "+49 (0) XXX XXXXXXXX"}</p>
                <p className="text-sm">{companyInfo?.email || "contact@example.com"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Registration</p>
                <p className="text-sm mt-1">HRB: {companyInfo?.regId || "XXXXXXX"}</p>
                <p className="text-sm">VAT ID: {companyInfo?.vatId || "DEXXXXXXXXX"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development & Hosting */}
        <Card>
          <CardHeader>
            <CardTitle>Development & Service Provision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>Product:</strong> IWRITE – AI-Powered Document Writing Workspace
            </p>
            <p>
              <strong>Developed by:</strong> Crew Art<br />
              <strong>Powered by:</strong> MH Trading GmbH
            </p>
            <p className="text-muted-foreground">
              IWRITE is developed and operated by MH Trading GmbH in cooperation with Crew Art. The service is provided as a Software-as-a-Service (SaaS) platform.
            </p>
          </CardContent>
        </Card>

        {/* Liability Notice */}
        <Card>
          <CardHeader>
            <CardTitle>Disclaimer & Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              The contents of IWRITE, including all text, graphics, and other materials, are provided on an "as is" basis. While we strive for accuracy and completeness, we do not warrant that the service will be error-free or uninterrupted.
            </p>
            <p>
              To the extent permitted by law, MH Trading GmbH and Crew Art shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the service or content.
            </p>
            <p>
              For detailed terms, please refer to our <strong>Terms of Use</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card>
          <CardHeader>
            <CardTitle>Data Protection Officer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              For data protection inquiries and requests, please contact us at the email address above or refer to our <strong>Privacy Policy</strong>.
            </p>
            <p className="text-muted-foreground">
              We are committed to protecting your privacy and complying with applicable data protection regulations (GDPR, etc.).
            </p>
          </CardContent>
        </Card>

        {/* Legal Review Notice */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
              ⚠ Template Notice
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This imprint is a template and should be reviewed and updated by legal counsel to ensure compliance with applicable laws in your jurisdiction.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
