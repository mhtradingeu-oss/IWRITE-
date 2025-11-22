import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyInfo {
  email: string;
}

export default function Privacy() {
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
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">How we collect, use, and protect your data</p>
      </div>

      <div className="space-y-6">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              We are committed to protecting your privacy. This Privacy Policy explains how IWRITE collects, uses, discloses, and safeguards your information when you use our service.
            </p>
            <p>
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Account Information</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Email address</li>
                <li>Password (hashed and encrypted)</li>
                <li>Account creation date</li>
                <li>Subscription plan and billing information</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">Usage Data</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Documents created and edited</li>
                <li>Files uploaded and templates used</li>
                <li>AI generation requests and responses</li>
                <li>Login timestamps and session data</li>
                <li>Feature usage statistics</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">Device & Access Information</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device type and operating system</li>
                <li>Referring URL and pages visited</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Legal Basis */}
        <Card>
          <CardHeader>
            <CardTitle>2. Legal Basis for Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>Contract Performance:</strong> We process your data to provide the IWRITE service, manage your account, and process payments.
            </p>
            <p>
              <strong>Legitimate Interests:</strong> We may process data to improve security, prevent fraud, and enhance our service.
            </p>
            <p>
              <strong>Legal Compliance:</strong> We comply with legal obligations and regulatory requirements.
            </p>
            <p>
              <strong>Consent:</strong> Marketing communications are sent only with your explicit consent.
            </p>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>3. Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>Account Data:</strong> Retained while your account is active and for 90 days after account deletion (unless legally required longer).
            </p>
            <p>
              <strong>Usage Data:</strong> Aggregated usage data is retained for service improvement. Individual usage logs are retained for 30 days.
            </p>
            <p>
              <strong>Payment Data:</strong> Processed securely via Stripe. We do not store full payment card details.
            </p>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card>
          <CardHeader>
            <CardTitle>4. Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Under GDPR and similar regulations, you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data (right to be forgotten)</li>
              <li><strong>Restriction:</strong> Request limitation of data processing</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
            </ul>
          </CardContent>
        </Card>

        {/* Third Parties */}
        <Card>
          <CardHeader>
            <CardTitle>5. Sharing with Third Parties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>Service Providers:</strong> We share data with trusted vendors for:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Payment processing (Stripe)</li>
              <li>Cloud infrastructure (storage and hosting)</li>
              <li>AI services (OpenAI for document generation)</li>
            </ul>
            <p className="pt-2">
              All service providers are contractually obligated to protect your data and use it only for the purposes specified.
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>6. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>HTTPS encryption for all data in transit</li>
              <li>Password hashing and salting</li>
              <li>Secure API tokens and session management</li>
              <li>Regular security audits and updates</li>
            </ul>
            <p className="pt-2 text-muted-foreground">
              However, no method of transmission is 100% secure. We encourage you to use strong passwords and enable two-factor authentication when available.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>7. Contact & Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              To exercise your rights or file a complaint, contact us at:
            </p>
            <p className="font-semibold">
              {companyInfo?.email || "contact@example.com"}
            </p>
            <p className="text-muted-foreground">
              We will respond to your request within 30 days as required by law.
            </p>
          </CardContent>
        </Card>

        {/* Legal Notice */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
              ⚠ Template Notice
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This privacy policy is a template and should be reviewed and customized by legal counsel to ensure compliance with GDPR, CCPA, and other applicable data protection laws in your jurisdiction.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
