import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast({
          title: "Error",
          description: error.error || "Authentication failed",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Success",
        description: isRegister ? "Account created" : "Logged in",
      });

      navigate("/");
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
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-2">IWRITE</h1>
          <p className="text-muted-foreground mb-6">
            AI-powered document workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                data-testid="input-email"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder={isRegister ? "Min 8 chars, 1 uppercase, 1 number" : ""}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                data-testid="input-password"
              />
              {isRegister && (
                <p className="text-xs text-muted-foreground mt-1">
                  Min 8 chars, 1 uppercase, 1 number
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
                ? "..."
                : isRegister
                  ? "Create Account"
                  : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center">
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
    </div>
  );
}
