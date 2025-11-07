import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, FileText, Edit, Trash2, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/components/LanguageProvider";
import type { Document, DocumentType } from "@shared/schema";

const translations = {
  en: {
    documents: "Documents",
    createNew: "Create New Document",
    noDocuments: "No documents yet. Create your first document!",
    generating: "Generating...",
    documentType: "Document Type",
    language: "Language",
    prompt: "Prompt",
    template: "Template (Optional)",
    styleProfile: "Style Profile (Optional)",
    generate: "Generate Document",
    cancel: "Cancel",
    selectType: "Select document type...",
    selectLanguage: "Select language...",
    enterPrompt: "Describe what you want to generate...",
    blog: "Blog Post",
    proposal: "Proposal",
    contract: "Contract",
    policy: "Policy",
    presentation: "Presentation",
    productPage: "Product Page",
    socialMedia: "Social Media Post",
    createdAt: "Created",
    view: "View",
    edit: "Edit",
    delete: "Delete",
    download: "Download",
  },
  ar: {
    documents: "المستندات",
    createNew: "إنشاء مستند جديد",
    noDocuments: "لا توجد مستندات بعد. قم بإنشاء مستندك الأول!",
    generating: "جاري التوليد...",
    documentType: "نوع المستند",
    language: "اللغة",
    prompt: "الوصف",
    template: "القالب (اختياري)",
    styleProfile: "ملف التعريف النمطي (اختياري)",
    generate: "توليد المستند",
    cancel: "إلغاء",
    selectType: "اختر نوع المستند...",
    selectLanguage: "اختر اللغة...",
    enterPrompt: "صف ما تريد توليده...",
    blog: "مقالة مدونة",
    proposal: "اقتراح",
    contract: "عقد",
    policy: "سياسة",
    presentation: "عرض تقديمي",
    productPage: "صفحة منتج",
    socialMedia: "منشور على وسائل التواصل",
    createdAt: "تاريخ الإنشاء",
    view: "عرض",
    edit: "تحرير",
    delete: "حذف",
    download: "تنزيل",
  },
  de: {
    documents: "Dokumente",
    createNew: "Neues Dokument erstellen",
    noDocuments: "Noch keine Dokumente. Erstellen Sie Ihr erstes Dokument!",
    generating: "Wird generiert...",
    documentType: "Dokumenttyp",
    language: "Sprache",
    prompt: "Eingabeaufforderung",
    template: "Vorlage (Optional)",
    styleProfile: "Stilprofil (Optional)",
    generate: "Dokument generieren",
    cancel: "Abbrechen",
    selectType: "Dokumenttyp wählen...",
    selectLanguage: "Sprache wählen...",
    enterPrompt: "Beschreiben Sie, was Sie generieren möchten...",
    blog: "Blog-Beitrag",
    proposal: "Vorschlag",
    contract: "Vertrag",
    policy: "Richtlinie",
    presentation: "Präsentation",
    productPage: "Produktseite",
    socialMedia: "Social Media Beitrag",
    createdAt: "Erstellt",
    view: "Ansehen",
    edit: "Bearbeiten",
    delete: "Löschen",
    download: "Herunterladen",
  },
};

export default function Documents() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    documentType: "" as DocumentType | "",
    language: "en" as "en" | "ar" | "de",
    prompt: "",
    templateId: "",
    styleProfileId: "",
  });

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
  });

  const { data: styleProfiles } = useQuery({
    queryKey: ["/api/style-profiles"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/documents/generate", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsDialogOpen(false);
      setFormData({
        documentType: "",
        language: "en",
        prompt: "",
        templateId: "",
        styleProfileId: "",
      });
      toast({
        title: "Document generated successfully",
        description: "Your document has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error generating document",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/documents/${id}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document deleted",
        description: "The document has been removed.",
      });
    },
  });

  const docTypeLabels = {
    blog: t.blog,
    proposal: t.proposal,
    contract: t.contract,
    policy: t.policy,
    presentation: t.presentation,
    "product-page": t.productPage,
    "social-media": t.socialMedia,
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">{t.documents}</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-document">
              <Plus className="h-4 w-4" />
              {t.createNew}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t.createNew}</DialogTitle>
              <DialogDescription>
                <Sparkles className="inline h-4 w-4 mr-1" />
                Use AI to generate professional documents
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="documentType">{t.documentType}</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value) => setFormData({ ...formData, documentType: value as DocumentType })}
                >
                  <SelectTrigger id="documentType" data-testid="select-document-type">
                    <SelectValue placeholder={t.selectType} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(docTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="language">{t.language}</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value as any })}
                >
                  <SelectTrigger id="language" data-testid="select-language">
                    <SelectValue placeholder={t.selectLanguage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prompt">{t.prompt}</Label>
                <Textarea
                  id="prompt"
                  placeholder={t.enterPrompt}
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="min-h-32"
                  data-testid="input-prompt"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="template">{t.template}</Label>
                  <Select
                    value={formData.templateId}
                    onValueChange={(value) => setFormData({ ...formData, templateId: value })}
                  >
                    <SelectTrigger id="template" data-testid="select-template">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template: any) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="styleProfile">{t.styleProfile}</Label>
                  <Select
                    value={formData.styleProfileId}
                    onValueChange={(value) => setFormData({ ...formData, styleProfileId: value })}
                  >
                    <SelectTrigger id="styleProfile" data-testid="select-style-profile">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {styleProfiles?.map((profile: any) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
                {t.cancel}
              </Button>
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={!formData.documentType || !formData.prompt || generateMutation.isPending}
                data-testid="button-generate"
              >
                {generateMutation.isPending ? t.generating : t.generate}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover-elevate" data-testid={`card-document-${doc.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{doc.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {doc.documentType && docTypeLabels[doc.documentType as keyof typeof docTypeLabels]} • {doc.language?.toUpperCase()}
                    </CardDescription>
                  </div>
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{doc.content}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(doc.createdAt).toLocaleDateString(language)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link href={`/documents/${doc.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-edit-${doc.id}`}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      data-testid={`button-delete-${doc.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">{t.noDocuments}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
