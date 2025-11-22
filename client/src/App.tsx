import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-auto bg-background">
                    <Router />
                  </main>
                </div>
              </div>
              <Toaster />
            </SidebarProvider>
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
