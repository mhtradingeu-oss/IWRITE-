import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Lock, User, Crown, Zap } from "lucide-react";
import { getRedirectPath } from "@/lib/auth-helpers";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const demoAccounts = [
    {
      label: "FREE User",
      email: "free@example.com",
      password: "FreeUser1234",
      icon: User,
      badge: "5 AI/day",
      color: "bg-blue-50 dark:bg-blue-950/30",
      testid: "button-demo-free",
    },
    {
      label: "PRO User",
      email: "pro@example.com",
      password: "ProUser1234",
      icon: Zap,
      badge: "Unlimited",
      color: "bg-purple-50 dark:bg-purple-950/30",
      testid: "button-demo-pro",
    },
    {
      label: "Admin",
      email: "admin@example.com",
      password: "Admin1234",
      icon: Crown,
      badge: "Full Access",
      color: "bg-amber-50 dark:bg-amber-950/30",
      testid: "button-demo-admin",
    },
  ];

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        let errorMessage = error.error || "Authentication failed";
        
        // Provide more helpful error messages
        if (response.status === 401) {
          errorMessage = isRegister 
            ? "Email already registered or invalid credentials"
            : "Invalid email or password";
        } else if (response.status === 400) {
          errorMessage = isRegister
            ? "Password does not meet requirements (min 8 chars, 1 uppercase, 1 number)"
            : error.error || "Invalid input";
        }
        
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      const redirectPath = getRedirectPath(data.user);

      toast({
        title: "Success",
        description: isRegister ? "Account created successfully" : "Logged in successfully",
      });

      // Navigate after a brief delay to show success toast
      setTimeout(() => navigate(redirectPath), 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-2xl">
        <Card className="mb-6">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded bg-primary flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold">IWRITE</h1>
            </div>
            <p className="text-muted-foreground mb-8">
              AI-powered document workspace with multi-language support
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div>
                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  data-testid="input-email"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isRegister ? "Min 8 chars, 1 uppercase, 1 number" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  data-testid="input-password"
                />
                {isRegister && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Requirements: minimum 8 characters, 1 uppercase letter, 1 number
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-submit"
              >
                {isLoading
                  ? "Loading..."
                  : isRegister
                    ? "Create Account"
                    : "Sign In"}
              </Button>
            </form>

            <div className="text-center border-t pt-4">
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-muted-foreground hover:underline"
                data-testid="button-toggle-auth"
              >
                {isRegister
                  ? "Already have account? Sign in"
                  : "Need account? Sign up"}
              </button>
            </div>
          </div>
        </Card>

        {!isRegister && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-muted-foreground">
              Demo Accounts - Click to fill credentials:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.testid}
                    onClick={() => handleDemoLogin(account.email, account.password)}
                    className={`${account.color} rounded-lg p-4 text-left hover:shadow-md transition-all border border-transparent hover:border-primary/20`}
                    data-testid={account.testid}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <span className="font-semibold text-sm">{account.label}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {account.badge}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>
                        <span className="font-medium">Email:</span> {account.email}
                      </p>
                      <p>
                        <span className="font-medium">Pass:</span> {account.password}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
