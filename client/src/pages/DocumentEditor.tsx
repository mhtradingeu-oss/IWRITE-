import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import {
  Save,
  ArrowLeft,
  Sparkles,
  Languages,
  CheckCircle2,
  AlertCircle,
  History,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/components/LanguageProvider";
import type { Document, QACheckResult } from "@shared/schema";

const translations = {
  en: {
    backToDocuments: "Back to Documents",
    untitled: "Untitled Document",
    title: "Title",
    content: "Content",
    save: "Save",
    saving: "Saving...",
    editor: "Editor",
    preview: "Preview",
    qa: "QA Checks",
    versions: "Versions",
    actions: "Actions",
    rewrite: "Rewrite with AI",
    translate: "Translate",
    runQA: "Run QA Check",
    qaTypes: {
      "medical-claims": "Medical Claims Detection",
      "disclaimer": "Disclaimer Check",
      "number-consistency": "Number Consistency",
      "product-code-cnpn": "Product Code Validation",
    },
    status: {
      passed: "Passed",
      warning: "Warning",
      failed: "Failed",
    },
    noQAResults: "No QA checks run yet",
    selectLanguage: "Select target language",
    translating: "Translating...",
    rewriting: "Rewriting...",
    export: "Export",
    exportFormat: "Export Format",
    exportDocument: "Export Document",
    exporting: "Exporting...",
  },
  ar: {
    backToDocuments: "العودة إلى المستندات",
    untitled: "مستند بدون عنوان",
    title: "العنوان",
    content: "المحتوى",
    save: "حفظ",
    saving: "جاري الحفظ...",
    editor: "المحرر",
    preview: "معاينة",
    qa: "فحص الجودة",
    versions: "النسخ",
    actions: "الإجراءات",
    rewrite: "إعادة الكتابة بالذكاء الاصطناعي",
    translate: "ترجمة",
    runQA: "تشغيل فحص الجودة",
    qaTypes: {
      "medical-claims": "كشف المطالبات الطبية",
      "disclaimer": "فحص إخلاء المسؤولية",
      "number-consistency": "اتساق الأرقام",
      "product-code-cnpn": "التحقق من رمز المنتج",
    },
    status: {
      passed: "نجح",
      warning: "تحذير",
      failed: "فشل",
    },
    noQAResults: "لم يتم تشغيل فحوصات الجودة بعد",
    selectLanguage: "اختر اللغة المستهدفة",
    translating: "جاري الترجمة...",
    rewriting: "جاري إعادة الكتابة...",
    export: "تصدير",
    exportFormat: "صيغة التصدير",
    exportDocument: "تصدير المستند",
    exporting: "جاري التصدير...",
  },
  de: {
    backToDocuments: "Zurück zu Dokumenten",
    untitled: "Unbenanntes Dokument",
    title: "Titel",
    content: "Inhalt",
    save: "Speichern",
    saving: "Speichert...",
    editor: "Editor",
    preview: "Vorschau",
    qa: "QA-Prüfungen",
    versions: "Versionen",
    actions: "Aktionen",
    rewrite: "Mit KI umschreiben",
    translate: "Übersetzen",
    runQA: "QA-Prüfung ausführen",
    qaTypes: {
      "medical-claims": "Erkennung medizinischer Ansprüche",
      "disclaimer": "Haftungsausschluss-Prüfung",
      "number-consistency": "Zahlenkonsistenz",
      "product-code-cnpn": "Produktcode-Validierung",
    },
    status: {
      passed: "Bestanden",
      warning: "Warnung",
      failed: "Fehlgeschlagen",
    },
    noQAResults: "Noch keine QA-Prüfungen durchgeführt",
    selectLanguage: "Zielsprache auswählen",
    translating: "Übersetzen...",
    rewriting: "Umschreiben...",
    export: "Exportieren",
    exportFormat: "Exportformat",
    exportDocument: "Dokument exportieren",
    exporting: "Exportiere...",
  },
};

interface DocumentVersion {
  id: string;
  version: number;
  createdAt: string;
  changeSummary?: string;
}

export default function DocumentEditor() {
  const [, params] = useRoute("/documents/:id");
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const { data: doc, isLoading } = useQuery<Document>({
    queryKey: [`/api/documents/${params?.id}`],
    enabled: !!params?.id,
  });

  const { data: qaResults = [] } = useQuery<QACheckResult[]>({
    queryKey: [`/api/documents/${params?.id}/qa-results`],
    enabled: !!params?.id,
  });

  const { data: versions = [] } = useQuery<DocumentVersion[]>({
    queryKey: [`/api/documents/${params?.id}/versions`],
    enabled: !!params?.id,
  });

  useEffect(() => {
    if (doc) {
      setFormData({
        title: doc.title,
        content: doc.content,
      });
    }
  }, [doc]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PUT", `/api/documents/${params?.id}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${params?.id}`] });
      toast({
        title: "Document saved",
        description: "Your changes have been saved.",
      });
    },
  });

  const rewriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/documents/${params?.id}/rewrite`, {
        removeDuplication: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${params?.id}`] });
      toast({
        title: "Document rewritten",
        description: "The document has been improved with AI.",
      });
    },
  });

  const translateMutation = useMutation({
    mutationFn: async (targetLanguage: string) => {
      return await apiRequest("POST", `/api/documents/${params?.id}/translate`, {
        targetLanguage,
      });
    },
    onSuccess: () => {
      toast({
        title: "Translation created",
        description: "A new translated document has been created.",
      });
      setLocation("/documents");
    },
  });

  const qaCheckMutation = useMutation({
    mutationFn: async (checkType: string) => {
      return await apiRequest("POST", `/api/documents/${params?.id}/qa-check`, {
        checkType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/documents/${params?.id}/qa-results`],
      });
      toast({
        title: "QA check completed",
        description: "The quality check has been performed.",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (format: "md" | "docx" | "pdf") => {
      // Trigger the export API call
      const response = await fetch(`/api/documents/${params?.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });
      
      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Create blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition?.match(/filename="([^"]+)"/)?.[1] || `document.${format}`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { format };
    },
    onSuccess: (data) => {
      toast({
        title: t.export + " " + t.status.passed,
        description: `Document exported successfully as ${data.format.toUpperCase()}`,
      });
    },
    onError: (error) => {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your document.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    if (status === "passed") return "default";
    if (status === "warning") return "secondary";
    return "destructive";
  };

  const getStatusIcon = (status: string) => {
    if (status === "passed") return <CheckCircle2 className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/documents")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="text-lg font-semibold border-0 focus-visible:ring-0 px-0"
            placeholder={t.untitled}
            data-testid="input-document-title"
          />
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-translate">
                <Languages className="h-4 w-4" />
                {t.translate}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.translate}</DialogTitle>
                <DialogDescription>{t.selectLanguage}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => translateMutation.mutate("en")}
                  disabled={translateMutation.isPending}
                  data-testid="button-translate-en"
                >
                  English
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => translateMutation.mutate("ar")}
                  disabled={translateMutation.isPending}
                  data-testid="button-translate-ar"
                >
                  العربية
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => translateMutation.mutate("de")}
                  disabled={translateMutation.isPending}
                  data-testid="button-translate-de"
                >
                  Deutsch
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={() => rewriteMutation.mutate()}
            disabled={rewriteMutation.isPending}
            data-testid="button-rewrite"
          >
            <Sparkles className="h-4 w-4" />
            {rewriteMutation.isPending ? t.rewriting : t.rewrite}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-export">
                <Download className="h-4 w-4" />
                {t.export}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.exportDocument}</DialogTitle>
                <DialogDescription>{t.exportFormat}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => exportMutation.mutate("md")}
                  disabled={exportMutation.isPending}
                  data-testid="button-export-md"
                >
                  Markdown (.md)
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => exportMutation.mutate("docx")}
                  disabled={exportMutation.isPending}
                  data-testid="button-export-docx"
                >
                  Word (.docx)
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => exportMutation.mutate("pdf")}
                  disabled={exportMutation.isPending}
                  data-testid="button-export-pdf"
                >
                  HTML (.html)
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            size="sm"
            data-testid="button-save"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? t.saving : t.save}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="editor" className="h-full">
          <TabsList>
            <TabsTrigger value="editor" data-testid="tab-editor">{t.editor}</TabsTrigger>
            <TabsTrigger value="preview" data-testid="tab-preview">{t.preview}</TabsTrigger>
            <TabsTrigger value="qa" data-testid="tab-qa">{t.qa}</TabsTrigger>
            <TabsTrigger value="versions" data-testid="tab-versions">{t.versions}</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="flex-1 mt-4">
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="min-h-[600px] font-mono text-sm"
              placeholder={t.content}
              data-testid="textarea-content"
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <Card>
              <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap">{formData.content}</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qa" className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              {Object.entries(t.qaTypes).map(([key, label]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => qaCheckMutation.mutate(key)}
                  disabled={qaCheckMutation.isPending}
                  data-testid={`button-qa-${key}`}
                >
                  {label}
                </Button>
              ))}
            </div>

            {qaResults.length > 0 ? (
              <div className="space-y-2">
                {qaResults.map((result) => (
                  <Card key={result.id} data-testid={`card-qa-${result.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          {t.qaTypes[result.checkType as keyof typeof t.qaTypes]}
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(result.status)}>
                          {t.status[result.status as keyof typeof t.status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    {result.issues && result.issues.length > 0 && (
                      <CardContent className="space-y-2">
                        {result.issues.map((issue: any, i: number) => (
                          <div key={i} className="text-sm border-l-2 border-border pl-3">
                            <p className="font-medium">{issue.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {issue.suggestion}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">{t.noQAResults}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="versions" className="mt-4 space-y-2">
            {versions.length > 0 ? (
              versions.map((version: DocumentVersion) => (
                <Card key={version.id} data-testid={`card-version-${version.id}`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <History className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Version {version.version}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(version.createdAt).toLocaleString(language)}
                        </p>
                      </div>
                    </div>
                    {version.changeSummary && (
                      <Badge variant="secondary" className="text-xs">
                        {version.changeSummary}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <History className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">No versions yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
