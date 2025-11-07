import { useQuery } from "@tanstack/react-query";
import { Archive as ArchiveIcon, FileText, Clock, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import type { DocumentVersion } from "@shared/schema";

const translations = {
  en: {
    archive: "Document Archive",
    noArchive: "No archived versions yet. Document versions will appear here.",
    version: "Version",
    changes: "Changes",
    viewVersion: "View Version",
    restore: "Restore",
  },
  ar: {
    archive: "أرشيف المستندات",
    noArchive: "لا توجد نسخ مؤرشفة بعد. ستظهر إصدارات المستندات هنا.",
    version: "النسخة",
    changes: "التغييرات",
    viewVersion: "عرض النسخة",
    restore: "استرجاع",
  },
  de: {
    archive: "Dokumentenarchiv",
    noArchive: "Noch keine archivierten Versionen. Dokumentversionen werden hier angezeigt.",
    version: "Version",
    changes: "Änderungen",
    viewVersion: "Version anzeigen",
    restore: "Wiederherstellen",
  },
};

export default function Archive() {
  const { language } = useLanguage();
  const t = translations[language];

  const { data: versions, isLoading } = useQuery<DocumentVersion[]>({
    queryKey: ["/api/archive/versions"],
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">{t.archive}</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-between p-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : versions && versions.length > 0 ? (
        <div className="space-y-2">
          {versions.map((version) => (
            <Card key={version.id} className="hover-elevate" data-testid={`card-version-${version.id}`}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <History className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{t.version} {version.version}</p>
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(version.createdAt).toLocaleString(language)}
                      </Badge>
                    </div>
                    {version.changeSummary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{version.changeSummary}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" data-testid={`button-view-${version.id}`}>
                    {t.viewVersion}
                  </Button>
                  <Button variant="ghost" size="sm" data-testid={`button-restore-${version.id}`}>
                    {t.restore}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ArchiveIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">{t.noArchive}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
