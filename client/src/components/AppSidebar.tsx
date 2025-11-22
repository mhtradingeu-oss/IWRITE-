import { Home, FileText, Upload, Layout, Wand2, Settings, Archive, FolderOpen, Tag, Search, Sparkles, Music, Shield } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./LanguageProvider";
import { isFree, isPro, isAdmin } from "@/lib/auth-helpers";

const translations = {
  en: {
    workspace: "Workspace",
    dashboard: "Dashboard",
    aiWriter: "AI Writer",
    songwriter: "Songwriter",
    documents: "Documents",
    uploads: "File Uploads",
    templates: "Templates",
    styleProfiles: "Style Profiles",
    settings: "Settings",
    management: "Management",
    archive: "Archive",
    topics: "Topics",
    search: "Search",
    library: "Library",
    upgradeRequired: "Upgrade to use",
  },
  ar: {
    workspace: "مساحة العمل",
    dashboard: "لوحة التحكم",
    aiWriter: "كاتب الذكاء الاصطناعي",
    songwriter: "كاتب الأغاني",
    documents: "المستندات",
    uploads: "رفع الملفات",
    templates: "القوالب",
    styleProfiles: "ملفات التعريف النمطية",
    settings: "الإعدادات",
    management: "الإدارة",
    archive: "الأرشيف",
    topics: "المواضيع",
    search: "البحث",
    library: "المكتبة",
    upgradeRequired: "ترقية للاستخدام",
  },
  de: {
    workspace: "Arbeitsbereich",
    dashboard: "Dashboard",
    aiWriter: "KI-Autor",
    songwriter: "Songwriter",
    documents: "Dokumente",
    uploads: "Datei-Uploads",
    templates: "Vorlagen",
    styleProfiles: "Stilprofile",
    settings: "Einstellungen",
    management: "Verwaltung",
    archive: "Archiv",
    topics: "Themen",
    search: "Suche",
    library: "Bibliothek",
    upgradeRequired: "Upgrade erforderlich",
  },
};

const mainItems = [
  {
    title: "dashboard",
    url: "/dashboard",
    icon: Home,
    requiresPro: false,
  },
  {
    title: "aiWriter",
    url: "/ai-writer",
    icon: Sparkles,
    requiresPro: false,
  },
  {
    title: "songwriter",
    url: "/songwriter",
    icon: Music,
    requiresPro: true,
  },
  {
    title: "documents",
    url: "/documents",
    icon: FileText,
    requiresPro: false,
  },
  {
    title: "uploads",
    url: "/uploads",
    icon: Upload,
    requiresPro: false,
  },
];

const managementItems = [
  {
    title: "templates",
    url: "/templates",
    icon: Layout,
    requiresPro: true,
  },
  {
    title: "styleProfiles",
    url: "/style-profiles",
    icon: Wand2,
    requiresPro: false,
  },
];

const libraryItems = [
  {
    title: "search",
    url: "/search",
    icon: Search,
    requiresPro: false,
  },
  {
    title: "topics",
    url: "/topics",
    icon: Tag,
    requiresPro: false,
  },
  {
    title: "archive",
    url: "/archive",
    icon: Archive,
    requiresPro: false,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      const response = await fetch("/auth/me", { credentials: "include" });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user;
    },
  });
  
  const userIsFree = isFree(user?.plan);
  const userIsAdmin = isAdmin(user?.role);

  if (isLoading) {
    return null;
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">IWRITE</span>
            <span className="text-xs text-muted-foreground">{userIsFree ? "FREE" : "PRO"}</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.workspace}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const isGated = item.requiresPro && userIsFree;
                
                if (isGated) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground opacity-60 cursor-not-allowed">
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{t[item.title as keyof typeof t]}</span>
                        <span className="text-xs bg-accent/30 px-2 py-0.5 rounded">{t.upgradeRequired}</span>
                      </div>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url} data-testid={`link-${item.title}`}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{t[item.title as keyof typeof t]}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t.management}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => {
                const isGated = item.requiresPro && userIsFree;
                
                if (isGated) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground opacity-60 cursor-not-allowed">
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{t[item.title as keyof typeof t]}</span>
                        <span className="text-xs bg-accent/30 px-2 py-0.5 rounded">{t.upgradeRequired}</span>
                      </div>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url} data-testid={`link-${item.title}`}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{t[item.title as keyof typeof t]}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t.library}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {libraryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`link-${item.title}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{t[item.title as keyof typeof t]}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-2">
        {userIsAdmin && (
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild data-testid="link-admin">
            <Link href="/admin">
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </Button>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start" asChild data-testid="button-settings">
          <Link href="/settings">
            <Settings className="h-4 w-4" />
            <span>{t.settings}</span>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
