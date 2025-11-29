import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyInfo {
  name: string;
  email: string;
}

export default function PaymentPolicy() {
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
        <h1 className="text-4xl font-bold mb-2">Payment & Refund Policy</h1>
        <p className="text-muted-foreground">
          Information about billing, payments, and refund policies
        </p>
      </div>

      <div className="space-y-6">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              This Payment & Refund Policy governs all billing and payment-related activities for IWRITE subscriptions and services. By purchasing a subscription or using our paid services, you agree to these terms.
            </p>
            <p className="text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        {/* Supported Plans */}
        <Card>
          <CardHeader>
            <CardTitle>1. Available Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-semibold">Free Plan</p>
              <p className="text-muted-foreground">
                5 AI generations per day. No charge. Unlimited templates and style profiles.
              </p>
            </div>

            <div className="pt-2 border-t">
              <p className="font-semibold">Pro Monthly</p>
              <p className="text-muted-foreground">
                EUR 14.99 per month. Unlimited AI generations and all features.
              </p>
            </div>

            <div className="pt-2 border-t">
              <p className="font-semibold">Pro Yearly</p>
              <p className="text-muted-foreground">
                EUR 149.99 per year (approximately 2 months free vs. monthly rate). Unlimited AI generations and all features.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Billing Cycles */}
        <Card>
          <CardHeader>
            <CardTitle>2. Billing Cycles & Charges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>Recurring Billing:</strong> Pro subscriptions are charged on a recurring basis. Monthly subscriptions renew every 30 days; yearly subscriptions renew every 365 days.
            </p>
            <p>
              <strong>Automatic Renewal:</strong> Your subscription automatically renews at the end of each billing period unless you cancel in advance. You will be charged on the anniversary of your subscription start date (for monthly) or calendar date (for yearly).
            </p>
            <p>
              <strong>Billing Details:</strong> Charges appear on your billing statement as "{companyInfo?.name || "MH Trading GmbH"}" or "IWRITE".
            </p>
          </CardContent>
        </Card>

        {/* Payment Processing */}
        <Card>
          <CardHeader>
            <CardTitle>3. Payment Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>Payment Method:</strong> All payments are processed securely via Stripe, a third-party payment processor. We do not store your full credit card details on our servers.
            </p>
            <p>
              <strong>Security:</strong> All payment transactions are encrypted and processed in compliance with PCI Data Security Standards.
            </p>
            <p>
              <strong>Payment Failure:</strong> If a payment fails (e.g., expired card, insufficient funds), we will attempt to retry. If payment remains unsuccessful after multiple attempts, your subscription may be suspended until payment is resolved.
            </p>
          </CardContent>
        </Card>

        {/* Cancellation */}
        <Card>
          <CardHeader>
            <CardTitle>4. Cancellation & Downgrade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>How to Cancel:</strong> You can cancel your subscription at any time through your account settings (Settings → Subscription). Cancellation takes effect at the end of your current billing period.
            </p>
            <p>
              <strong>Access After Cancellation:</strong> You will continue to have access to Pro features until the end of your paid billing period. After that, your account reverts to the Free plan.
            </p>
            <p>
              <strong>Downgrade:</strong> You can downgrade from Pro to Free at any time. The change takes effect immediately, and you will not be charged for the next billing period.
            </p>
            <p>
              <strong>No Refund for Downgrade:</strong> Downgrading does not result in a refund of your current subscription period.
            </p>
          </CardContent>
        </Card>

        {/* Refunds */}
        <Card>
          <CardHeader>
            <CardTitle>5. Refund Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>General Policy:</strong> Refunds for subscription payments are generally not available. You are responsible for reviewing your subscription terms and managing your subscription through your account.
            </p>
            <p>
              <strong>Exceptions:</strong> Refunds may be considered in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
              <li>Billing error or duplicate charge (within 30 days of the charge)</li>
              <li>Service unavailability exceeding 72 hours (pro-rata refund possible)</li>
              <li>Other circumstances at our discretion</li>
            </ul>

            <p className="pt-4">
              <strong>Refund Request Process:</strong> To request a refund, contact us at {companyInfo?.email || "contact@example.com"} with your subscription details and reason. We will review your request within 10 business days.
            </p>
          </CardContent>
        </Card>

        {/* Price Changes */}
        <Card>
          <CardHeader>
            <CardTitle>6. Price Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              We may change subscription prices with 30 days' written notice. Price increases take effect at your next billing renewal date.
            </p>
            <p>
              If you do not accept the new price, you may cancel your subscription before the increase takes effect.
            </p>
          </CardContent>
        </Card>

        {/* Taxes */}
        <Card>
          <CardHeader>
            <CardTitle>7. Taxes & VAT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Prices displayed are exclusive of VAT and applicable sales taxes unless otherwise stated. Applicable VAT and sales taxes will be calculated and added at checkout based on your location.
            </p>
            <p>
              You are responsible for any applicable taxes owed on your payments.
            </p>
          </CardContent>
        </Card>

        {/* Billing Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle>8. Billing Questions & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              For billing inquiries, payment issues, or refund requests, please contact us at:
            </p>
            <p className="font-semibold">
              {companyInfo?.email || "contact@example.com"}
            </p>
            <p className="text-muted-foreground">
              Response time: Within 10 business days.
            </p>
          </CardContent>
        </Card>

        {/* Stripe Terms */}
        <Card>
          <CardHeader>
            <CardTitle>9. Third-Party Payment Processor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Payments are processed by Stripe, Inc. Your use of Stripe's services is subject to Stripe's Terms of Service and Privacy Policy. For details on how Stripe handles your payment information, please visit <strong>stripe.com</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Free Trial */}
        <Card>
          <CardHeader>
            <CardTitle>10. Free Trial (if applicable)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              IWRITE does not currently offer a free trial for Pro plans. However, the Free plan provides full access to core features with usage limits (5 AI generations per day).
            </p>
            <p className="text-muted-foreground">
              Free trial terms may be introduced in the future with separate terms and conditions.
            </p>
          </CardContent>
        </Card>

        {/* Legal Notice */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
              ⚠ Template & Legal Notice
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This Payment & Refund Policy is a template and should be reviewed by legal and financial counsel to ensure compliance with payment regulations, consumer protection laws, and tax requirements in your jurisdiction.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
