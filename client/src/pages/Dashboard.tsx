import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Layout, Wand2, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/LanguageProvider";

const translations = {
  en: {
    welcome: "Welcome to IWRITE",
    subtitle: "Overview of your projects, documents, and recent activity",
    documents: "Documents",
    uploads: "Uploads",
    templates: "Templates",
    styleProfiles: "Style Profiles",
    totalDocs: "Total Documents",
    uploadedFiles: "Uploaded Files",
    activeTemplates: "Active Templates",
    styleProfs: "Style Profiles",
    recentActivity: "Recent Activity",
    quickActions: "Quick Actions",
    createDocument: "Create New Document",
    uploadFiles: "Upload Files",
    manageTemplates: "Manage Templates",
    noActivity: "No recent activity yet. Start creating documents!",
  },
  ar: {
    welcome: "مرحباً بك في IWRITE",
    subtitle: "نظرة عامة على مشاريعك والمستندات والنشاط الأخير",
    documents: "المستندات",
    uploads: "الملفات المرفوعة",
    templates: "القوالب",
    styleProfiles: "ملفات التعريف النمطية",
    totalDocs: "إجمالي المستندات",
    uploadedFiles: "الملفات المرفوعة",
    activeTemplates: "القوالب النشطة",
    styleProfs: "ملفات التعريف النمطية",
    recentActivity: "النشاط الأخير",
    quickActions: "إجراءات سريعة",
    createDocument: "إنشاء مستند جديد",
    uploadFiles: "رفع الملفات",
    manageTemplates: "إدارة القوالب",
    noActivity: "لا يوجد نشاط حديث بعد. ابدأ في إنشاء المستندات!",
  },
  de: {
    welcome: "Willkommen bei IWRITE",
    subtitle: "Übersicht über Ihre Projekte, Dokumente und aktuelle Aktivitäten",
    documents: "Dokumente",
    uploads: "Uploads",
    templates: "Vorlagen",
    styleProfiles: "Stilprofile",
    totalDocs: "Gesamt Dokumente",
    uploadedFiles: "Hochgeladene Dateien",
    activeTemplates: "Aktive Vorlagen",
    styleProfs: "Stilprofile",
    recentActivity: "Letzte Aktivität",
    quickActions: "Schnellaktionen",
    createDocument: "Neues Dokument erstellen",
    uploadFiles: "Dateien hochladen",
    manageTemplates: "Vorlagen verwalten",
    noActivity: "Noch keine aktuelle Aktivität. Beginnen Sie mit der Erstellung von Dokumenten!",
  },
};

export default function Dashboard() {
  const { language } = useLanguage();
  const t = translations[language];

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["/api/dashboard/activity"],
  });

  const statCards = [
    { title: t.totalDocs, value: stats?.documents || 0, icon: FileText, color: "text-blue-500" },
    { title: t.uploadedFiles, value: stats?.uploads || 0, icon: Upload, color: "text-green-500" },
    { title: t.activeTemplates, value: stats?.templates || 0, icon: Layout, color: "text-purple-500" },
    { title: t.styleProfs, value: stats?.styleProfiles || 0, icon: Wand2, color: "text-orange-500" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">{t.welcome}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold" data-testid={`stat-${index}`}>{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t.recentActivity}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
                    <TrendingUp className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.noActivity}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.quickActions}</CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/documents">
              <Button className="w-full justify-start" data-testid="button-create-document">
                <FileText className="h-4 w-4" />
                {t.createDocument}
              </Button>
            </Link>
            <Link href="/uploads">
              <Button variant="outline" className="w-full justify-start" data-testid="button-upload-files">
                <Upload className="h-4 w-4" />
                {t.uploadFiles}
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="outline" className="w-full justify-start" data-testid="button-manage-templates">
                <Layout className="h-4 w-4" />
                {t.manageTemplates}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
