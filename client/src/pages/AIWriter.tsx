import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/components/LanguageProvider";
import { isPro, isFree } from "@/lib/auth-helpers";
import type { UploadedFile, Topic } from "@shared/schema";

const translations = {
  en: {
    aiWriter: "AI Writer",
    subtitle: "Create professional documents from prompts. Rewrite, translate, and improve content in Arabic, German, and English.",
    prompt: "What would you like to create or improve?",
    promptPlaceholder: "Be specific: describe the document type, audience, key points, and tone you want...",
    createNewDocument: "Create New Document",
    generateDocumentButton: "Generate New Document",
    advancedTools: "Advanced Tools",
    advancedToolsDescription: "Additional AI capabilities for existing content",
    documentType: "Document Type",
    catalogPage: "Catalog Page",
    productSheet: "Product Sheet",
    distributorOffer: "Distributor Offer",
    contract: "Contract / Agreement",
    sop: "SOP / Internal Guide",
    email: "Email / Letter",
    marketingPage: "Marketing Page",
    targetLength: "Target Length",
    short: "Short",
    medium: "Medium",
    long: "Long",
    formality: "Formality Level",
    veryFormal: "Very Formal",
    business: "Business",
    friendly: "Friendly-but-professional",
    language: "Language",
    generate: "Generate",
    improve: "Improve",
    editor: "Document Preview",
    title: "Document Title",
    untitled: "Untitled Document",
    sources: "Sources",
    documents: "Documents",
    topics: "Topics",
    selectSources: "Ground generations with your documents and topics",
    templates: "Templates",
    chooseTemplate: "Choose a template",
    applyOnExport: "Apply template styling on export only",
    loading: "Generating...",
    error: "Something went wrong",
    success: "Generated successfully",
    characterCount: "characters",
    tips: "Tips for better results",
    tip1: "Be specific about document type and target audience",
    tip2: "Reference uploaded files by their title in prompts",
    tip3: "Use AR/DE/EN language selector for multilingual content",
    freeUserLimit: "FREE plan – 5 generations remaining today",
    proUser: "PRO – Unlimited daily generations",
    openInDocuments: "Open in Documents",
    rewriteImprove: "Rewrite & Improve",
    summarize: "Summarize",
    expand: "Expand / Add Detail",
    translate: "Translate",
    fixStyle: "Fix Style & Tone",
    generateVariants: "Generate Variants",
  },
  ar: {
    aiWriter: "كاتب الذكاء الاصطناعي",
    subtitle: "أنشئ مستندات احترافية من التعليمات. أعد كتابة والترجمة وحسّن المحتوى باللغة العربية والألمانية والإنجليزية.",
    prompt: "ما الذي تريد إنشاءه أو تحسينه؟",
    promptPlaceholder: "كن محدداً: صف نوع المستند والجمهور المستهدف والنقاط الرئيسية والنبرة المطلوبة...",
    createNewDocument: "إنشاء مستند جديد",
    generateDocumentButton: "إنشاء المستند",
    advancedTools: "أدوات متقدمة",
    advancedToolsDescription: "قدرات ذكاء اصطناعي إضافية للمحتوى الموجود",
    documentType: "نوع المستند",
    catalogPage: "صفحة كاتالوج",
    productSheet: "ورقة المنتج",
    distributorOffer: "عرض الموزع",
    contract: "العقد / الاتفاقية",
    sop: "SOP / دليل داخلي",
    email: "البريد الإلكتروني / الرسالة",
    marketingPage: "صفحة التسويق",
    targetLength: "الطول المستهدف",
    short: "قصير",
    medium: "متوسط",
    long: "طويل",
    formality: "مستوى الرسمية",
    veryFormal: "رسمي جداً",
    business: "أعمال",
    friendly: "ودود لكن احترافي",
    language: "اللغة",
    generate: "إنشاء",
    improve: "تحسين",
    editor: "معاينة المستند",
    title: "عنوان المستند",
    untitled: "مستند بدون عنوان",
    sources: "المصادر",
    documents: "المستندات",
    topics: "المواضيع",
    selectSources: "ركّز الإنشاء باستخدام مستنداتك ومواضيعك",
    templates: "القوالب",
    chooseTemplate: "اختر قالباً",
    applyOnExport: "تطبيق تنسيق القالب عند التصدير فقط",
    loading: "جاري الإنشاء...",
    error: "حدث خطأ ما",
    success: "تم الإنشاء بنجاح",
    characterCount: "أحرف",
    tips: "نصائح للنتائج الأفضل",
    tip1: "كن محدداً حول نوع المستند والجمهور المستهدف",
    tip2: "أشِر إلى الملفات المرفوعة باسمها في التعليمات",
    tip3: "استخدم محدد اللغة AR/DE/EN للمحتوى متعدد اللغات",
    freeUserLimit: "الخطة المجانية – 5 إنشاءات متبقية اليوم",
    proUser: "PRO – عمليات إنشاء غير محدودة يومياً",
    openInDocuments: "فتح في المستندات",
    rewriteImprove: "إعادة الكتابة والتحسين",
    summarize: "ملخص",
    expand: "توسيع / إضافة تفاصيل",
    translate: "ترجمة",
    fixStyle: "إصلاح الأسلوب والنبرة",
    generateVariants: "توليد متغيرات",
  },
  de: {
    aiWriter: "KI-Autor",
    subtitle: "Erstellen Sie professionelle Dokumente aus Eingaben. Schreiben Sie um, übersetzen und verbessern Sie Inhalte auf Arabisch, Deutsch und Englisch.",
    prompt: "Was möchten Sie erstellen oder verbessern?",
    promptPlaceholder: "Seien Sie spezifisch: beschreiben Sie den Dokumenttyp, die Zielgruppe, wichtige Punkte und den Ton...",
    createNewDocument: "Neues Dokument erstellen",
    generateDocumentButton: "Dokument generieren",
    advancedTools: "Erweiterte Tools",
    advancedToolsDescription: "Zusätzliche KI-Fähigkeiten für bestehende Inhalte",
    documentType: "Dokumenttyp",
    catalogPage: "Katalogseite",
    productSheet: "Produktblatt",
    distributorOffer: "Vertriebsangebot",
    contract: "Vertrag / Vereinbarung",
    sop: "SOP / Interner Leitfaden",
    email: "E-Mail / Brief",
    marketingPage: "Marketingseite",
    targetLength: "Ziellänge",
    short: "Kurz",
    medium: "Mittel",
    long: "Lang",
    formality: "Formalitätsstufe",
    veryFormal: "Sehr formal",
    business: "Geschäft",
    friendly: "Freundlich, aber professionell",
    language: "Sprache",
    generate: "Generieren",
    improve: "Verbessern",
    editor: "Dokumentvorschau",
    title: "Dokumenttitel",
    untitled: "Unbenanntes Dokument",
    sources: "Quellen",
    documents: "Dokumente",
    topics: "Themen",
    selectSources: "Fundieren Sie Generierungen mit Ihren Dokumenten und Themen",
    templates: "Vorlagen",
    chooseTemplate: "Wählen Sie eine Vorlage",
    applyOnExport: "Vorlagenstil nur beim Export anwenden",
    loading: "Wird generiert...",
    error: "Etwas ist schief gelaufen",
    success: "Erfolgreich generiert",
    characterCount: "Zeichen",
    tips: "Tipps für bessere Ergebnisse",
    tip1: "Seien Sie spezifisch hinsichtlich Dokumenttyp und Zielgruppe",
    tip2: "Referenzieren Sie hochgeladene Dateien in Eingaben nach Name",
    tip3: "Verwenden Sie die Sprachauswahl AR/DE/EN für mehrsprachige Inhalte",
    freeUserLimit: "KOSTENLOS – 5 Generierungen noch heute verfügbar",
    proUser: "PRO – Unbegrenzte tägliche Generierungen",
    openInDocuments: "In Dokumenten öffnen",
    rewriteImprove: "Umschreiben und Verbessern",
    summarize: "Zusammenfassung",
    expand: "Erweitern / Mehr Details",
    translate: "Übersetzen",
    fixStyle: "Stil und Ton anpassen",
    generateVariants: "Varianten generieren",
  },
};

export default function AIWriter() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];
  const isRTL = language === "ar";

  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState(t.untitled);
  const [generatedContent, setGeneratedContent] = useState("");
  const [documentType, setDocumentType] = useState("product-sheet");
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [targetLength, setTargetLength] = useState("medium");
  const [formality, setFormality] = useState("business");
  const [templateId, setTemplateId] = useState("");
  const [savedDocId, setSavedDocId] = useState<string | null>(null);

  // Fetch user data for plan/usage info
  const { data: user } = useQuery({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      const response = await fetch("/auth/me", { credentials: "include" });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user;
    },
  });

  // Fetch documents, topics, and templates
  const { data: documents = [] } = useQuery({
    queryKey: ["/api/documents"],
  });

  const { data: topics = [] } = useQuery({
    queryKey: ["/api/topics"],
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/templates"],
  });

  // AI generation mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/documents/generate", {
        prompt,
        documentType,
        language: selectedLanguage,
        targetLength,
        formality,
        templateId: templateId || undefined,
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content || "");
      setTitle(data.title || t.untitled);
      setSavedDocId(data.id);
      toast({
        title: t.success,
        description: "Document generated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: t.error,
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex flex-col h-full gap-6 p-6 overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              {t.aiWriter}
            </h1>
            {user && (
              <Badge variant={isPro(user.plan) ? "default" : "secondary"} data-testid="badge-plan">
                {isPro(user.plan) ? t.proUser : t.freeUserLimit}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create New Document */}
          <Card data-testid="card-create-document">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {t.createNewDocument}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prompt */}
              <div className="space-y-2">
                <Label htmlFor="prompt">{t.prompt}</Label>
                <Textarea
                  id="prompt"
                  placeholder={t.promptPlaceholder}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-32 resize-none"
                  data-testid="textarea-ai-prompt"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {prompt.length} {t.characterCount}
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctype">{t.documentType}</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="doctype" data-testid="select-document-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="catalog-page">{t.catalogPage}</SelectItem>
                      <SelectItem value="product-sheet">{t.productSheet}</SelectItem>
                      <SelectItem value="distributor-offer">{t.distributorOffer}</SelectItem>
                      <SelectItem value="contract">{t.contract}</SelectItem>
                      <SelectItem value="sop">{t.sop}</SelectItem>
                      <SelectItem value="email">{t.email}</SelectItem>
                      <SelectItem value="marketing-page">{t.marketingPage}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">{t.language}</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger id="language" data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length">{t.targetLength}</Label>
                  <Select value={targetLength} onValueChange={setTargetLength}>
                    <SelectTrigger id="length" data-testid="select-target-length">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">{t.short}</SelectItem>
                      <SelectItem value="medium">{t.medium}</SelectItem>
                      <SelectItem value="long">{t.long}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formality">{t.formality}</Label>
                  <Select value={formality} onValueChange={setFormality}>
                    <SelectTrigger id="formality" data-testid="select-formality">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very-formal">{t.veryFormal}</SelectItem>
                      <SelectItem value="business">{t.business}</SelectItem>
                      <SelectItem value="friendly">{t.friendly}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={!prompt || generateMutation.isPending}
                size="lg"
                className="w-full"
                data-testid="button-generate"
              >
                {generateMutation.isPending ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin mr-2" />
                    {t.loading}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t.generateDocumentButton}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Content Preview */}
          {generatedContent && (
            <Card data-testid="card-preview">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle>{t.editor}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {generatedContent.length} {t.characterCount}
                  </p>
                </div>
                {savedDocId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = `/documents/${savedDocId}`)}
                    data-testid="button-open-document"
                  >
                    {t.openInDocuments}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-md max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedContent}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Right */}
        <div className="space-y-6">
          {/* Advanced Tools */}
          <Card data-testid="card-advanced-tools">
            <CardHeader>
              <CardTitle className="text-base">{t.advancedTools}</CardTitle>
              <CardDescription className="text-xs">{t.advancedToolsDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {["rewriteImprove", "summarize", "expand", "translate", "fixStyle", "generateVariants"].map(
                  (preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt(t[preset as keyof typeof t])}
                      className="text-xs h-auto py-2"
                      data-testid={`button-preset-${preset}`}
                    >
                      {t[preset as keyof typeof t]}
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card data-testid="card-tips">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                {t.tips}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{t.tip1}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{t.tip2}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{t.tip3}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Sources & Templates Tabs */}
          <Tabs defaultValue="sources" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sources" data-testid="tab-sources" className="text-xs">
                {t.sources}
              </TabsTrigger>
              <TabsTrigger value="templates" data-testid="tab-templates" className="text-xs">
                {t.templates}
              </TabsTrigger>
            </TabsList>

            {/* Sources Tab */}
            <TabsContent value="sources" className="space-y-3 mt-4">
              <div className="text-xs text-muted-foreground">{t.selectSources}</div>

              {/* Documents */}
              {documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{t.documents}</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted">
                        <Checkbox
                          id={`doc-${doc.id}`}
                          data-testid={`checkbox-source-doc-${doc.id}`}
                        />
                        <label
                          htmlFor={`doc-${doc.id}`}
                          className="flex-1 text-xs cursor-pointer font-medium"
                        >
                          {doc.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              {topics.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{t.topics}</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {topics.map((topic: any) => (
                      <div key={topic.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted">
                        <Checkbox
                          id={`topic-${topic.id}`}
                          data-testid={`checkbox-source-topic-${topic.id}`}
                        />
                        <label htmlFor={`topic-${topic.id}`} className="flex-1 text-xs cursor-pointer">
                          <div className="font-medium">{topic.name}</div>
                          {topic.keywords && (
                            <div className="text-muted-foreground text-xs">
                              {topic.keywords.join(", ")}
                            </div>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-3 mt-4">
              <Label htmlFor="template">{t.chooseTemplate}</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger id="template" data-testid="select-template">
                  <SelectValue placeholder={t.chooseTemplate} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template: any) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
