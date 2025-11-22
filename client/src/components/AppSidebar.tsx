import { Home, FileText, Upload, Layout, Wand2, Settings, Archive, FolderOpen, Tag, Search, Sparkles, Music } from "lucide-react";
import { useLocation, Link } from "wouter";
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
  },
};

const mainItems = [
  {
    title: "dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "aiWriter",
    url: "/ai-writer",
    icon: Sparkles,
  },
  {
    title: "songwriter",
    url: "/songwriter",
    icon: Music,
  },
  {
    title: "documents",
    url: "/documents",
    icon: FileText,
  },
  {
    title: "uploads",
    url: "/uploads",
    icon: Upload,
  },
];

const managementItems = [
  {
    title: "templates",
    url: "/templates",
    icon: Layout,
  },
  {
    title: "styleProfiles",
    url: "/style-profiles",
    icon: Wand2,
  },
];

const libraryItems = [
  {
    title: "search",
    url: "/search",
    icon: Search,
  },
  {
    title: "topics",
    url: "/topics",
    icon: Tag,
  },
  {
    title: "archive",
    url: "/archive",
    icon: Archive,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">IWRITE</span>
            <span className="text-xs text-muted-foreground">AI Workspace</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.workspace}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>{t.management}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
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

      <SidebarFooter className="p-4 border-t border-sidebar-border">
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
