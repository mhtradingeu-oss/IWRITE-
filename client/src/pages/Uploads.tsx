import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload as UploadIcon, FileText, File, Image, Table, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/components/LanguageProvider";
import type { UploadedFile } from "@shared/schema";

const translations = {
  en: {
    uploads: "File Uploads",
    uploadNew: "Upload Files",
    noUploads: "No uploaded files yet. Upload your first file to get started!",
    dragDrop: "Drag & drop files here or click to browse",
    supportedFormats: "Supported: PDF, DOCX, CSV, XLSX, Images",
    fileName: "File Name",
    fileType: "Type",
    uploadedAt: "Uploaded",
    actions: "Actions",
    delete: "Delete",
    download: "Download",
    view: "View",
  },
  ar: {
    uploads: "الملفات المرفوعة",
    uploadNew: "رفع ملفات",
    noUploads: "لا توجد ملفات مرفوعة بعد. ارفع أول ملف للبدء!",
    dragDrop: "اسحب وأفلت الملفات هنا أو انقر للتصفح",
    supportedFormats: "مدعوم: PDF, DOCX, CSV, XLSX, صور",
    fileName: "اسم الملف",
    fileType: "النوع",
    uploadedAt: "تاريخ الرفع",
    actions: "الإجراءات",
    delete: "حذف",
    download: "تنزيل",
    view: "عرض",
  },
  de: {
    uploads: "Datei-Uploads",
    uploadNew: "Dateien hochladen",
    noUploads: "Noch keine hochgeladenen Dateien. Laden Sie Ihre erste Datei hoch!",
    dragDrop: "Dateien hierher ziehen oder klicken zum Durchsuchen",
    supportedFormats: "Unterstützt: PDF, DOCX, CSV, XLSX, Bilder",
    fileName: "Dateiname",
    fileType: "Typ",
    uploadedAt: "Hochgeladen",
    actions: "Aktionen",
    delete: "Löschen",
    download: "Herunterladen",
    view: "Ansehen",
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
  const [isDragging, setIsDragging] = useState(false);

  const { data: uploads, isLoading } = useQuery<UploadedFile[]>({
    queryKey: ["/api/uploads"],
  });

  const uploadMutation = useMutation({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      toast({
        title: "Files uploaded successfully",
        description: "Your files have been processed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error uploading files",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/uploads/${id}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      toast({
        title: "File deleted",
        description: "The file has been removed.",
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-download-${upload.id}`}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(upload.id)}
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
    </div>
  );
}
