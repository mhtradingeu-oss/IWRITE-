import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyInfo {
  name: string;
  email: string;
}

export default function Terms() {
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
        <h1 className="text-4xl font-bold mb-2">Terms of Use</h1>
        <p className="text-muted-foreground">
          Agreement governing the use of IWRITE services
        </p>
      </div>

      <div className="space-y-6">
        {/* Acceptance */}
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              By accessing and using IWRITE, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card>
          <CardHeader>
            <CardTitle>2. Service Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              IWRITE is an AI-powered document writing workspace. We provide:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Document creation and editing tools</li>
              <li>AI-assisted writing and content generation</li>
              <li>Templates, style profiles, and export functionality</li>
              <li>File storage and management</li>
              <li>Free and premium (PRO) subscription tiers</li>
            </ul>
            <p className="pt-2">
              Services are provided "as is" without warranties of any kind. We reserve the right to modify or discontinue the service with reasonable notice.
            </p>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>3. User Accounts & Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>Account Registration:</strong> You are responsible for maintaining the confidentiality of your email and password. You agree to provide accurate, current, and complete information.
            </p>
            <p>
              <strong>Account Responsibility:</strong> You are responsible for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
            <p>
              <strong>Account Termination:</strong> We may terminate or suspend your account at any time for violations of these terms or for other reasons at our discretion.
            </p>
          </CardContent>
        </Card>

        {/* Subscriptions & Payment */}
        <Card>
          <CardHeader>
            <CardTitle>4. Subscriptions & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>Pricing:</strong> Pricing is displayed clearly on the /plans page. We reserve the right to change pricing with 30 days' notice.
            </p>
            <p>
              <strong>Recurring Billing:</strong> Pro plans are charged on a recurring basis (monthly or yearly as selected). Billing continues until you cancel your subscription.
            </p>
            <p>
              <strong>Payment Methods:</strong> We accept payments via Stripe. All payment information is processed securely and encrypted. We do not store full payment card details.
            </p>
            <p>
              <strong>Cancellation:</strong> You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of your current billing period.
            </p>
            <p>
              <strong>Refunds:</strong> Refunds are issued in accordance with our Payment Policy. Generally, no refunds are provided for partial months or unused service.
            </p>
          </CardContent>
        </Card>

        {/* Usage Restrictions */}
        <Card>
          <CardHeader>
            <CardTitle>5. Acceptable Use & Restrictions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>You agree NOT to use IWRITE to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Transmit malware, viruses, or malicious code</li>
              <li>Harass, abuse, or defame anyone</li>
              <li>Circumvent security measures or access unauthorized areas</li>
              <li>Engage in spam or unsolicited communications</li>
              <li>Use bots or automated scraping tools (except as explicitly allowed)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle>6. Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>IWRITE Content:</strong> All content, features, and functionality of IWRITE are the property of MH Trading GmbH or its content suppliers. They are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              <strong>Your Content:</strong> You retain ownership of content you create in IWRITE. By using our service, you grant us a non-exclusive, royalty-free license to store, backup, and display your content for service delivery purposes.
            </p>
            <p>
              <strong>AI-Generated Content:</strong> Content generated using our AI features is created based on your input. You are responsible for verifying and editing AI output for accuracy and appropriateness before publishing or sharing.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle>7. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL {companyInfo?.name || "MH TRADING GMBH"} BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p>
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE PRECEDING 12 MONTHS, OR EUR 100, WHICHEVER IS GREATER.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card>
          <CardHeader>
            <CardTitle>8. Disclaimer of Warranties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              THE SERVICE IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS. WE MAKE NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p>
              WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, SECURE, UNINTERRUPTED, OR MEET YOUR REQUIREMENTS.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card>
          <CardHeader>
            <CardTitle>9. Governing Law & Jurisdiction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              These Terms of Use are governed by and construed in accordance with the laws of Germany, and you irrevocably submit to the exclusive jurisdiction of the courts of Germany.
            </p>
            <p>
              The United Nations Convention on Contracts for the International Sale of Goods shall not apply.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>10. Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              If you have questions about these Terms of Use, please contact us at:
            </p>
            <p className="font-semibold">
              {companyInfo?.email || "contact@example.com"}
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
              These Terms of Use are a template and should be reviewed by legal counsel to ensure compliance with applicable laws and industry standards in your jurisdiction.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
