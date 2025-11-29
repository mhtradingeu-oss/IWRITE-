import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Archive as ArchiveIcon, FileText, Clock, Trash2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { createAppMutation } from "@/lib/mutationHelper";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { fillTemplate } from "@/lib/utils";
import type { Document } from "@shared/schema";

const translations = {
  en: {
    archive: "Document Archive",
    archiveDescription: "View and manage your archived documents. Restore documents back to your main library or permanently delete them.",
    cancel: "Cancel",
    noArchive: "No archived documents yet. When you archive documents, they will appear here.",
    title: "Title",
    type: "Type",
    archivedDate: "Archived",
    createdDate: "Created",
    restore: "Restore",
    delete: "Delete",
    restoring: "Restoring...",
    deleting: "Deleting...",
    confirmDeleteTitle: "Delete permanently?",
    confirmDeleteDescription: "Are you sure you want to delete {name}? This will permanently delete the document.",
    restoreSuccess: "Document restored successfully",
    deleteSuccess: "Document deleted permanently",
    restoreError: "Failed to restore document",
    deleteError: "Failed to delete document",
  },
  ar: {
    archive: "أرشيف المستندات",
    archiveDescription: "اعرض وأدر مستنداتك المؤرشفة. استرجع المستندات إلى مكتبتك الرئيسية أو احذفها نهائياً.",
    cancel: "إلغاء",
    noArchive: "لا توجد مستندات مؤرشفة بعد. عند أرشفتك للمستندات ستظهر هنا.",
    title: "العنوان",
    type: "النوع",
    archivedDate: "تاريخ الأرشفة",
    createdDate: "تاريخ الإنشاء",
    restore: "استرجاع",
    delete: "حذف",
    restoring: "جاري الاسترجاع...",
    deleting: "جاري الحذف...",
    confirmDeleteTitle: "حذف دائم؟",
    confirmDeleteDescription: "هل أنت متأكد أنك تريد حذف {name}? سيتم حذف المستند نهائياً.",
    restoreSuccess: "تم استرجاع المستند بنجاح",
    deleteSuccess: "تم حذف المستند نهائياً",
    restoreError: "فشل استرجاع المستند",
    deleteError: "فشل حذف المستند",
  },
  de: {
    archive: "Dokumentenarchiv",
    archiveDescription: "Anzeigen und Verwalten Ihrer archivierten Dokumente. Stellen Sie Dokumente in Ihrer Hauptbibliothek wieder her oder löschen Sie sie dauerhaft.",
    cancel: "Abbrechen",
    noArchive: "Noch keine archivierten Dokumente. Wenn Sie Dokumente archivieren, werden sie hier angezeigt.",
    title: "Titel",
    type: "Typ",
    archivedDate: "Archiviert",
    createdDate: "Erstellt",
    restore: "Wiederherstellen",
    delete: "Löschen",
    restoring: "Wird wiederhergestellt...",
    deleting: "Wird gelöscht...",
    confirmDeleteTitle: "Dauerhaft löschen?",
    confirmDeleteDescription: "Sind Sie sicher, dass Sie {name} löschen möchten? Das Dokument wird dauerhaft gelöscht.",
    restoreSuccess: "Dokument erfolgreich wiederhergestellt",
    deleteSuccess: "Dokument dauerhaft gelöscht",
    restoreError: "Fehler beim Wiederherstellen des Dokuments",
    deleteError: "Fehler beim Löschen des Dokuments",
  },
};

export default function Archive() {
  const { language } = useLanguage();
  const t = translations[language];
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docPendingDelete, setDocPendingDelete] = useState<Document | null>(null);

  const { data: archivedDocs = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents/archived"],
  });

  const restoreMutation = createAppMutation({
    mutationFn: async (docId: string) => {
      setRestoringId(docId);
      return await apiRequest("PATCH", `/api/documents/${docId}/restore`, null);
    },
    onSuccessMessage: t.restoreSuccess,
    onErrorMessage: t.restoreError,
    invalidate: ["/api/documents/archived", "/api/documents"],
    debugLabel: "restore-document",
    onSuccess: () => {
      setRestoringId(null);
    },
    onError: () => {
      setRestoringId(null);
    },
  });

  const deleteMutation = createAppMutation({
    mutationFn: async (docId: string) => {
      setDeletingId(docId);
      return await apiRequest("DELETE", `/api/documents/${docId}/permanent`, null);
    },
    onSuccessMessage: t.deleteSuccess,
    onErrorMessage: t.deleteError,
    invalidate: ["/api/documents/archived"],
    debugLabel: "delete-archive",
    onSuccess: () => {
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
    },
  });

  const handleRestore = (docId: string) => {
    restoreMutation.mutate(docId);
  };

  const openDeleteDialog = (doc: Document) => {
    setDocPendingDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setDocPendingDelete(null);
    }
  };

  const getDocumentLabel = () => {
    if (!docPendingDelete) {
      return t.archive;
    }
    if (docPendingDelete.title?.trim()) {
      return docPendingDelete.title;
    }
    return docPendingDelete.documentType || t.archive;
  };

  const deleteDialogDescription = fillTemplate(t.confirmDeleteDescription, {
    name: getDocumentLabel(),
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">{t.archive}</h1>
        <p className="text-muted-foreground mt-2">{t.archiveDescription}</p>
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
      ) : archivedDocs && archivedDocs.length > 0 ? (
        <div className="space-y-2">
          {archivedDocs.map((doc) => (
            <Card key={doc.id} className="hover-elevate" data-testid={`card-archived-${doc.id}`}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.title}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                      {doc.documentType && (
                        <Badge variant="secondary" className="text-xs">
                          {doc.documentType}
                        </Badge>
                      )}
                      <span>
                        <Clock className="h-3 w-3 inline mr-1" />
                        {t.createdDate}: {new Date(doc.createdAt).toLocaleDateString(language)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(doc.id)}
                    disabled={restoringId === doc.id}
                    data-testid={`button-restore-${doc.id}`}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    {restoringId === doc.id ? t.restoring : t.restore}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(doc)}
                    disabled={deletingId === doc.id}
                    className="text-destructive hover:text-destructive"
                    data-testid={`button-delete-${doc.id}`}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {deletingId === doc.id ? t.deleting : t.delete}
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
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        title={t.confirmDeleteTitle}
        description={deleteDialogDescription}
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        tone="danger"
        onConfirm={async () => {
          if (!docPendingDelete) {
            return;
          }
          await deleteMutation.mutateAsync(docPendingDelete.id);
        }}
      />
    </div>
  );
}
