import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload as UploadIcon, FileText, File, Image, Table, Trash2, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { useLanguage } from "@/components/LanguageProvider";
import { fillTemplate } from "@/lib/utils";
import { createAppMutation } from "@/lib/mutationHelper";
import type { UploadedFile } from "@shared/schema";

const translations = {
  en: {
    uploads: "File Uploads",
    uploadNew: "Upload Files",
    cancel: "Cancel",
    noUploads: "No uploaded files yet. Upload your first file to get started!",
    dragDrop: "Drag & drop files here or click to browse",
    supportedFormats: "Supported: PDF, DOCX, CSV, XLSX, Images",
    fileName: "File Name",
    fileType: "Type",
    uploadedAt: "Uploaded",
    actions: "Actions",
    saveSuccess: "Files uploaded successfully",
    saveError: "Failed to upload files",
    delete: "Delete",
    confirmDeleteFileTitle: "Delete upload?",
    confirmDeleteFileDescription: "Are you sure you want to delete {name}? This cannot be undone.",
    download: "Download",
    view: "View",
    process: "Process",
    processing: "Processing...",
    processSuccess: "File processed successfully",
    processError: "Failed to process file",
    deleteSuccess: "File deleted",
    deleteError: "Failed to delete file",
  },
  ar: {
    uploads: "الملفات المرفوعة",
    uploadNew: "رفع ملفات",
    cancel: "إلغاء",
    noUploads: "لا توجد ملفات مرفوعة بعد. ارفع أول ملف للبدء!",
    dragDrop: "اسحب وأفلت الملفات هنا أو انقر للتصفح",
    supportedFormats: "مدعوم: PDF, DOCX, CSV, XLSX, صور",
    fileName: "اسم الملف",
    fileType: "النوع",
    uploadedAt: "تاريخ الرفع",
    actions: "الإجراءات",
    saveSuccess: "تم رفع الملفات بنجاح",
    saveError: "فشل رفع الملفات",
    delete: "حذف",
    confirmDeleteFileTitle: "حذف الرفع؟",
    confirmDeleteFileDescription: "هل أنت متأكد أنك تريد حذف {name}? لا يمكن التراجع عن هذا الإجراء.",
    download: "تنزيل",
    view: "عرض",
    process: "معالجة",
    processing: "جاري المعالجة...",
    processSuccess: "تمت معالجة الملف بنجاح",
    processError: "فشلت معالجة الملف",
    deleteSuccess: "تم حذف الملف",
    deleteError: "فشل حذف الملف",
  },
  de: {
    uploads: "Datei-Uploads",
    uploadNew: "Dateien hochladen",
    cancel: "Abbrechen",
    noUploads: "Noch keine hochgeladenen Dateien. Laden Sie Ihre erste Datei hoch!",
    dragDrop: "Dateien hierher ziehen oder klicken zum Durchsuchen",
    supportedFormats: "Unterstützt: PDF, DOCX, CSV, XLSX, Bilder",
    fileName: "Dateiname",
    fileType: "Typ",
    uploadedAt: "Hochgeladen",
    actions: "Aktionen",
    saveSuccess: "Dateien erfolgreich hochgeladen",
    saveError: "Datei-Upload fehlgeschlagen",
    delete: "Löschen",
    confirmDeleteFileTitle: "Upload löschen?",
    confirmDeleteFileDescription: "Möchten Sie {name} wirklich löschen? Dies kann nicht rückgängig gemacht werden.",
    download: "Herunterladen",
    view: "Ansehen",
    process: "Verarbeiten",
    processing: "Verarbeitung...",
    processSuccess: "Datei erfolgreich verarbeitet",
    processError: "Verarbeitung fehlgeschlagen",
    deleteSuccess: "Datei gelöscht",
    deleteError: "Datei konnte nicht gelöscht werden",
  },
};

const fileIcons = {
  pdf: FileText,
  docx: FileText,
  csv: Table,
  xlsx: Table,
  image: Image,
  default: File,
};

export default function Uploads() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadPendingDelete, setUploadPendingDelete] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { data: uploads, isLoading } = useQuery<UploadedFile[]>({
    queryKey: ["/api/uploads"],
  });

  const uploadMutation = createAppMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      return await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      }).then((res) => res.json());
    },
    onSuccessMessage: t.saveSuccess,
    onErrorMessage: t.saveError,
    invalidate: ["/api/uploads"],
    retry: 1,
    debugLabel: "upload-files",
  });

  const deleteMutation = createAppMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/uploads/${id}`, null);
    },
    onSuccessMessage: t.deleteSuccess,
    onErrorMessage: t.deleteError,
    invalidate: ["/api/uploads"],
    debugLabel: "delete-upload",
  });

  const processMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/topic-intelligence/process-file/${fileId}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: (data, fileId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      toast({
        title: t.processSuccess,
        description: `Extracted ${data.chunks} chunks, ${data.topics.length} topics, ${data.entities} entities`,
      });
    },
    onError: (error: any) => {
      toast({
        title: t.processError,
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadMutation.mutate(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadMutation.mutate(e.target.files);
    }
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setUploadPendingDelete(null);
    }
  };

  const deleteDialogDescription = fillTemplate(t.confirmDeleteFileDescription, {
    name: uploadPendingDelete?.filename ?? t.uploads,
  });

  const getFileIcon = (fileType: string) => {
    const Icon = fileIcons[fileType as keyof typeof fileIcons] || fileIcons.default;
    return Icon;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">{t.uploads}</h1>
        </div>
      </div>

      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-accent/50" : "border-border"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UploadIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground mb-2">{t.dragDrop}</p>
          <p className="text-xs text-muted-foreground mb-4">{t.supportedFormats}</p>
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.csv,.xlsx,image/*"
            className="hidden"
            id="file-upload"
            onChange={handleFileInput}
            data-testid="input-file-upload"
          />
          <label htmlFor="file-upload">
            <Button asChild data-testid="button-upload-files">
              <span>{t.uploadNew}</span>
            </Button>
          </label>
        </CardContent>
      </Card>

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
      ) : uploads && uploads.length > 0 ? (
        <div className="space-y-2">
          {uploads.map((upload) => {
            const FileIcon = getFileIcon(upload.fileType);
            return (
              <Card key={upload.id} className="hover-elevate" data-testid={`card-upload-${upload.id}`}>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{upload.filename}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {upload.fileType.toUpperCase()}
                        </Badge>
                        <span>{new Date(upload.uploadedAt).toLocaleDateString(language)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => processMutation.mutate(upload.id)}
                      disabled={processMutation.isPending}
                      data-testid={`button-process-${upload.id}`}
                      className="h-8"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {processMutation.isPending ? t.processing : t.process}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-download-${upload.id}`}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        setUploadPendingDelete(upload);
                        setDeleteDialogOpen(true);
                      }}
                      data-testid={`button-delete-${upload.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UploadIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">{t.noUploads}</p>
          </CardContent>
        </Card>
      )}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        title={t.confirmDeleteFileTitle}
        description={deleteDialogDescription}
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        tone="danger"
        onConfirm={async () => {
          if (!uploadPendingDelete) {
            return;
          }
          await deleteMutation.mutateAsync(uploadPendingDelete.id);
        }}
      />
    </div>
  );
}
