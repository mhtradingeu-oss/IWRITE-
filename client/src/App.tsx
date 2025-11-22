import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { AppFooter } from "@/components/AppFooter";
import Login from "@/pages/Login";
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
import Plans from "@/pages/Plans";
import Settings from "@/pages/Settings";
import UpgradeSuccess from "@/pages/UpgradeSuccess";
import Admin from "@/pages/Admin";
import Imprint from "@/pages/legal/Imprint";
import Privacy from "@/pages/legal/Privacy";
import Terms from "@/pages/legal/Terms";
import PaymentPolicy from "@/pages/legal/PaymentPolicy";
import NotFound from "@/pages/not-found";

function RootRedirect() {
  const [, navigate] = useLocation();
  const { data: user } = useQuery({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      const response = await fetch("/auth/me", { credentials: "include" });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user;
    },
  });

  useEffect(() => {
    if (user) {
      // Auto-redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  return null;
}

function Router() {
  return (
    <Switch>
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
      <Route path="/plans" component={Plans} />
      <Route path="/settings" component={Settings} />
      <Route path="/upgrade/success" component={UpgradeSuccess} />
      <Route path="/admin" component={Admin} />
      <Route path="/legal/imprint" component={Imprint} />
      <Route path="/legal/privacy" component={Privacy} />
      <Route path="/legal/terms" component={Terms} />
      <Route path="/legal/payment" component={PaymentPolicy} />
      <Route path="/" component={RootRedirect} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex flex-col h-screen w-full">
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto bg-background">
              <Router />
            </main>
          </div>
        </div>
        <AppFooter />
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

function AppLayout() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      const response = await fetch("/auth/me", { credentials: "include" });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user;
    },
  });

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <TooltipProvider>
        <ThemeProvider>
          <Login />
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  );
}

function App() {
  return <AppLayout />;
}

export default App;
