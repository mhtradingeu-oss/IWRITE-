import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function UpgradeSuccess() {
  const [, navigate] = useLocation();

  // Get session_id from URL params
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  const { data, isLoading } = useQuery({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      const response = await fetch("/auth/me", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch user");
      const data = await response.json();
      return data.user;
    },
    refetchInterval: 2000, // Poll every 2 seconds for fresh data
  });

  useEffect(() => {
    // Invalidate user cache after successful payment
    if (data && data.plan !== "FREE") {
      queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
    }
  }, [data]);

  const isPro = data?.plan && data.plan !== "FREE";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isLoading ? (
            <>
              <Loader2 className="w-12 h-12 mx-auto text-primary mb-4 animate-spin" />
              <CardTitle>Processing Payment</CardTitle>
              <CardDescription>Please wait while we confirm your upgrade...</CardDescription>
            </>
          ) : isPro ? (
            <>
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 dark:text-green-400 mb-4" />
              <CardTitle>Welcome to PRO!</CardTitle>
              <CardDescription>Your upgrade was successful. Let's get started.</CardDescription>
            </>
          ) : (
            <>
              <CardTitle>Payment Processing</CardTitle>
              <CardDescription>We're updating your account...</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {isPro && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                ✓ Plan Upgraded Successfully
              </p>
              <p className="text-xs text-green-800 dark:text-green-200">
                You now have unlimited AI generations and access to all PRO features.
              </p>
            </div>
          )}

          {isPro && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
              <p className="text-lg font-bold">{data?.plan}</p>
            </div>
          )}

          <div className="space-y-2 pt-4">
            <Button onClick={() => navigate("/")} className="w-full">
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate("/settings")} className="w-full">
              View Account Settings
            </Button>
          </div>

          {sessionId && (
            <p className="text-xs text-muted-foreground text-center pt-4">
              Session ID: {sessionId.substring(0, 16)}...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
