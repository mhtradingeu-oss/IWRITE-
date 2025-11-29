import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Login from "@/pages/Login";
import { getRedirectPath, isAdmin } from "@/lib/auth-helpers";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/Documents";
import DocumentEditor from "@/pages/DocumentEditor";
import Uploads from "@/pages/Uploads";
import Templates from "@/pages/Templates";
import StyleProfiles from "@/pages/StyleProfiles";
import Archive from "@/pages/Archive";
import Topics from "@/pages/Topics";
import TopicPack from "@/pages/TopicPack";
import TopicSearch from "@/pages/TopicSearch";
import AIWriter from "@/pages/AIWriter";
import Songwriter from "@/pages/Songwriter";
import Upgrade from "@/pages/Upgrade";
import Plans from "@/pages/Plans";
import Settings from "@/pages/Settings";
import UpgradeSuccess from "@/pages/UpgradeSuccess";
import Admin from "@/pages/Admin";
import Imprint from "@/pages/legal/Imprint";
import Privacy from "@/pages/legal/Privacy";
import Terms from "@/pages/legal/Terms";
import PaymentPolicy from "@/pages/legal/PaymentPolicy";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/ai-writer" component={AIWriter} />
      <Route path="/songwriter" component={Songwriter} />
      <Route path="/documents" component={Documents} />
      <Route path="/documents/:id" component={DocumentEditor} />
      <Route path="/uploads" component={Uploads} />
      <Route path="/templates" component={Templates} />
      <Route path="/style-profiles" component={StyleProfiles} />
      <Route path="/archive" component={Archive} />
      <Route path="/topics" component={Topics} />
      <Route path="/topics/:id" component={TopicPack} />
      <Route path="/search" component={TopicSearch} />
      <Route path="/upgrade" component={Upgrade} />
      <Route path="/plans" component={Plans} />
      <Route path="/settings" component={Settings} />
      <Route path="/upgrade/success" component={UpgradeSuccess} />
      <Route path="/admin" component={Admin} />
      <Route path="/legal/imprint" component={Imprint} />
      <Route path="/legal/privacy" component={Privacy} />
      <Route path="/legal/terms" component={Terms} />
      <Route path="/legal/payment" component={PaymentPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

const AUTHENTICATED_ROUTES = [
  "/dashboard",
  "/ai-writer",
  "/songwriter",
  "/documents",
  "/documents/:id",
  "/uploads",
  "/templates",
  "/style-profiles",
  "/archive",
  "/topics",
  "/topics/:id",
  "/search",
  "/upgrade",
  "/plans",
  "/settings",
  "/upgrade/success",
  "/admin",
];

function isAuthenticatedRoute(pathname: string): boolean {
  // Check exact matches and parameterized routes
  return AUTHENTICATED_ROUTES.some(route => {
    if (route === pathname) return true;
    if (route.includes(":")) {
      const pattern = route.replace(/:\w+/g, "[^/]+");
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return false;
  });
}

function AppContent({ isAuthenticated, user }: { isAuthenticated: boolean; user: any }) {
  const [location] = useLocation();
  const showSidebarAndHeader = isAuthenticated && isAuthenticatedRoute(location);
  
  // Show access denied for non-admins on /admin
  if (location === "/admin" && user && !isAdmin(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>Admin console is restricted to administrators only</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/dashboard"} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex flex-col h-screen w-full">
        <div className="flex flex-1 overflow-hidden">
          {showSidebarAndHeader && <AppSidebar />}
          <div className="flex flex-col flex-1 overflow-hidden">
            {showSidebarAndHeader && <Header />}
            <main className="flex-1 overflow-auto bg-background">
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}

function AppLayout() {
  const [location, navigate] = useLocation();
  const { data: user, isLoading } = useQuery({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      const response = await fetch("/auth/me", { credentials: "include" });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user;
    },
  });

  // Handle redirects based on auth status and location
  useEffect(() => {
    if (isLoading) return;

    // Redirect unauthenticated users from protected routes to login
    if (isAuthenticatedRoute(location) && !user) {
      navigate("/login");
      return;
    }

    // Redirect authenticated users from login page to correct dashboard
    if (location === "/login" && user) {
      const redirectPath = getRedirectPath(user);
      navigate(redirectPath);
      return;
    }

    // Redirect non-admins from admin page to dashboard
    if (location === "/admin" && user && !isAdmin(user.role)) {
      navigate("/dashboard");
      return;
    }
  }, [location, user, isLoading, navigate]);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  // Don't render protected content while redirecting unauthenticated user
  if (isAuthenticatedRoute(location) && !user) {
    return null;
  }

  return (
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent isAuthenticated={!!user} user={user} />
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  );
}

function App() {
  return <AppLayout />;
}

export default App;
