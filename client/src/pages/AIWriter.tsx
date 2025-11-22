import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sparkles, Send, RefreshCw, FileDown, Check, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { UploadedFile, Topic } from "@shared/schema";

const translations = {
  en: {
    aiWriter: "AI Writer",
    subtitle: "Professional document creation with AI assistance",
    prompt: "Prompt",
    promptPlaceholder: "Describe exactly what you want the AI to generate or improve...",
    taskPresets: "Task Presets",
    newDocument: "New Document from Sources",
    rewriteImprove: "Rewrite & Improve",
    summarize: "Summarize",
    expand: "Expand / Add Detail",
    translate: "Translate",
    fixStyle: "Fix Style & Tone",
    generateVariants: "Generate Variants",
    documentType: "Document Type",
    catalogPage: "Catalog Page",
    productSheet: "Product Sheet",
    distributorOffer: "Distributor Offer",
    contract: "Contract / Agreement",
    sop: "SOP / Internal Guide",
    email: "Email / Letter",
    marketingPage: "Marketing Page",
    qualityOptions: "Quality Options",
    targetLength: "Target Length",
    short: "Short",
    medium: "Medium",
    long: "Long",
    formality: "Formality Level",
    veryFormal: "Very Formal",
    business: "Business",
    friendly: "Friendly-but-professional",
    language: "Language",
    generate: "Generate Draft",
    improve: "Improve Current Draft",
    editor: "Document Editor",
    title: "Document Title",
    untitled: "Untitled Document",
    showStructure: "Show Structure",
    sources: "Sources",
    documents: "Documents",
    topics: "Topics",
    selectSources: "Selected sources are used to ground AI generations",
    templates: "Templates",
    chooseTemplate: "Choose a template",
    applyOnExport: "Apply template styling on export only",
    qa: "QA Checks",
    runQA: "Run QA Checks",
    qaResults: "QA Results",
    noIssues: "No issues found",
    issue: "Issue",
    suggestion: "Suggested Fix",
    severity: "Severity",
    loading: "Generating...",
    error: "Something went wrong",
    success: "Generated successfully",
    characterCount: "characters",
  },
  ar: {
    aiWriter: "كاتب الذكاء الاصطناعي",
    subtitle: "إنشاء مستندات احترافية بمساعدة الذكاء الاصطناعي",
    prompt: "التعليمات",
    promptPlaceholder: "صف بالضبط ما تريد من الذكاء الاصطناعي أن ينشئه أو يحسنه...",
    taskPresets: "المهام المحددة مسبقاً",
    newDocument: "مستند جديد من المصادر",
    rewriteImprove: "إعادة الكتابة والتحسين",
    summarize: "ملخص",
    expand: "توسيع / إضافة تفاصيل",
    translate: "ترجمة",
    fixStyle: "إصلاح الأسلوب والنبرة",
    generateVariants: "توليد متغيرات",
    documentType: "نوع المستند",
    catalogPage: "صفحة كاتالوج",
    productSheet: "ورقة المنتج",
    distributorOffer: "عرض الموزع",
    contract: "العقد / الاتفاقية",
    sop: "SOP / دليل داخلي",
    email: "البريد الإلكتروني / الرسالة",
    marketingPage: "صفحة التسويق",
    qualityOptions: "خيارات الجودة",
    targetLength: "الطول المستهدف",
    short: "قصير",
    medium: "متوسط",
    long: "طويل",
    formality: "مستوى الرسمية",
    veryFormal: "رسمي جداً",
    business: "أعمال",
    friendly: "ودود لكن احترافي",
    language: "اللغة",
    generate: "إنشاء مسودة",
    improve: "تحسين المسودة الحالية",
    editor: "محرر المستند",
    title: "عنوان المستند",
    untitled: "مستند بدون عنوان",
    showStructure: "إظهار البنية",
    sources: "المصادر",
    documents: "المستندات",
    topics: "المواضيع",
    selectSources: "تُستخدم المصادر المحددة لتأسيس إنشاء الذكاء الاصطناعي",
    templates: "القوالب",
    chooseTemplate: "اختر قالباً",
    applyOnExport: "تطبيق تنسيق القالب عند التصدير فقط",
    qa: "فحوصات الجودة",
    runQA: "تشغيل فحوصات الجودة",
    qaResults: "نتائج الجودة",
    noIssues: "لم يتم العثور على مشاكل",
    issue: "المشكلة",
    suggestion: "الإصلاح المقترح",
    severity: "الخطورة",
    loading: "جاري الإنشاء...",
    error: "حدث خطأ ما",
    success: "تم الإنشاء بنجاح",
    characterCount: "أحرف",
  },
  de: {
    aiWriter: "KI-Autor",
    subtitle: "Professionelle Dokumentenerstellung mit KI-Unterstützung",
    prompt: "Eingabeaufforderung",
    promptPlaceholder: "Beschreiben Sie genau, was die KI generieren oder verbessern soll...",
    taskPresets: "Vordefinierte Aufgaben",
    newDocument: "Neues Dokument aus Quellen",
    rewriteImprove: "Umschreiben und Verbessern",
    summarize: "Zusammenfassung",
    expand: "Erweitern / Mehr Details",
    translate: "Übersetzen",
    fixStyle: "Stil und Ton anpassen",
    generateVariants: "Varianten generieren",
    documentType: "Dokumenttyp",
    catalogPage: "Katalogseite",
    productSheet: "Produktblatt",
    distributorOffer: "Vertriebsangebot",
    contract: "Vertrag / Vereinbarung",
    sop: "SOP / Interner Leitfaden",
    email: "E-Mail / Brief",
    marketingPage: "Marketingseite",
    qualityOptions: "Qualitätsoptionen",
    targetLength: "Ziellänge",
    short: "Kurz",
    medium: "Mittel",
    long: "Lang",
    formality: "Formalitätsstufe",
    veryFormal: "Sehr formal",
    business: "Geschäft",
    friendly: "Freundlich, aber professionell",
    language: "Sprache",
    generate: "Entwurf generieren",
    improve: "Aktuellen Entwurf verbessern",
    editor: "Dokumenteditor",
    title: "Dokumenttitel",
    untitled: "Unbenanntes Dokument",
    showStructure: "Struktur anzeigen",
    sources: "Quellen",
    documents: "Dokumente",
    topics: "Themen",
    selectSources: "Ausgewählte Quellen werden zur Begründung von KI-Generierungen verwendet",
    templates: "Vorlagen",
    chooseTemplate: "Wählen Sie eine Vorlage",
    applyOnExport: "Vorlagenstil nur beim Export anwenden",
    qa: "Qualitätsprüfungen",
    runQA: "Qualitätsprüfungen durchführen",
    qaResults: "Qualitätsergebnisse",
    noIssues: "Keine Probleme gefunden",
    issue: "Problem",
    suggestion: "Vorschlag zur Behebung",
    severity: "Schweregrad",
    loading: "Wird generiert...",
    error: "Etwas ist schief gelaufen",
    success: "Erfolgreich generiert",
    characterCount: "Zeichen",
  },
};

const taskPresetButtons = [
  "newDocument",
  "rewriteImprove",
  "summarize",
  "expand",
  "translate",
  "fixStyle",
  "generateVariants",
];

export default function AIWriter() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];
  const isRTL = language === "ar";

  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState(t.untitled);
  const [generatedContent, setGeneratedContent] = useState("");
  const [documentType, setDocumentType] = useState("product-page");
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [targetLength, setTargetLength] = useState("medium");
  const [formality, setFormality] = useState("business");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [showStructure, setShowStructure] = useState(false);

  // Fetch documents and topics
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
      const response = await apiRequest("POST", "/api/ai-writer/generate", {
        prompt,
        documentType,
        language: selectedLanguage,
        targetLength,
        formality,
        templateId,
        sourceDocumentIds: selectedSources,
        topicIds: selectedTopics,
        currentContent: generatedContent,
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content || "");
      toast({
        title: t.success,
        description: "Your draft has been generated",
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

  const handleTaskPreset = (preset: string) => {
    const presets: Record<string, string> = {
      newDocument: "Create a new, comprehensive document based on the selected sources and prompt",
      rewriteImprove: "Rewrite and improve the current draft to be clearer and more professional",
      summarize: "Summarize the current draft into a concise version",
      expand: "Expand the current draft with more details and examples",
      translate: "Translate the current draft into the selected language",
      fixStyle: "Fix the style and tone to match the selected formality level",
      generateVariants: "Generate multiple variants of the current draft with different approaches",
    };
    setPrompt(presets[preset] || "");
  };

  return (
    <div className={`flex h-full ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
      {/* Left Panel - Prompt & Controls */}
      <div className="w-[30%] border-r border-border bg-card overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              {t.aiWriter}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">{t.prompt}</Label>
            <Textarea
              id="prompt"
              placeholder={t.promptPlaceholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-24 resize-none"
              data-testid="textarea-ai-prompt"
            />
            <div className="text-xs text-muted-foreground text-right">
              {prompt.length} {t.characterCount}
            </div>
          </div>

          {/* Task Presets */}
          <div className="space-y-2">
            <Label>{t.taskPresets}</Label>
            <div className="grid grid-cols-2 gap-2">
              {taskPresetButtons.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTaskPreset(preset)}
                  className="text-xs h-auto py-2"
                  data-testid={`button-preset-${preset}`}
                >
                  {t[preset as keyof typeof t]}
                </Button>
              ))}
            </div>
          </div>

          {/* Document Type */}
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

          {/* Quality Options */}
          <div className="space-y-4">
            <div>
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

            <div>
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

            <div>
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
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={!prompt || generateMutation.isPending}
              className="flex-1"
              data-testid="button-generate"
            >
              {generateMutation.isPending ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  {t.loading}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t.generate}
                </>
              )}
            </Button>
            {generatedContent && (
              <Button
                variant="outline"
                onClick={() => generateMutation.mutate()}
                disabled={!prompt || generateMutation.isPending}
                data-testid="button-improve"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Center Panel - Document Editor */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="border-b border-border p-4 space-y-4">
          <Input
            placeholder={t.title}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold"
            data-testid="input-document-title"
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id="structure"
              checked={showStructure}
              onCheckedChange={setShowStructure}
              data-testid="checkbox-show-structure"
            />
            <Label htmlFor="structure" className="cursor-pointer">
              {t.showStructure}
            </Label>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-auto p-6">
          {generateMutation.isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : generatedContent ? (
            <Card className="border-0 shadow-none">
              <CardContent className="p-0 prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {generatedContent}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <p>{t.editor}</p>
              <p className="text-xs mt-2">Generated content will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Sources, Templates & QA */}
      <div className="w-[25%] border-l border-border bg-card overflow-y-auto">
        <Tabs defaultValue="sources" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="sources" data-testid="tab-sources">
              {t.sources}
            </TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">
              {t.templates}
            </TabsTrigger>
            <TabsTrigger value="qa" data-testid="tab-qa">
              {t.qa}
            </TabsTrigger>
          </TabsList>

          {/* Sources Tab */}
          <TabsContent value="sources" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">{t.selectSources}</div>

              {/* Documents */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{t.documents}</h4>
                {documents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No documents available</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted">
                        <Checkbox
                          id={`doc-${doc.id}`}
                          checked={selectedSources.includes(doc.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSources([...selectedSources, doc.id]);
                            } else {
                              setSelectedSources(selectedSources.filter((id) => id !== doc.id));
                            }
                          }}
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
                )}
              </div>

              {/* Topics */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{t.topics}</h4>
                {topics.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No topics available</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {topics.map((topic: any) => (
                      <div key={topic.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted">
                        <Checkbox
                          id={`topic-${topic.id}`}
                          checked={selectedTopics.includes(topic.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTopics([...selectedTopics, topic.id]);
                            } else {
                              setSelectedTopics(selectedTopics.filter((id) => id !== topic.id));
                            }
                          }}
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
                )}
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
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
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Checkbox
                id="applyOnExport"
                defaultChecked
                data-testid="checkbox-apply-template"
              />
              <Label htmlFor="applyOnExport" className="text-xs cursor-pointer font-normal">
                {t.applyOnExport}
              </Label>
            </div>
          </TabsContent>

          {/* QA Tab */}
          <TabsContent value="qa" className="flex-1 overflow-y-auto p-4 space-y-4">
            <Button
              onClick={() => {
                toast({
                  title: "QA Check",
                  description: "QA checks would run here",
                });
              }}
              className="w-full"
              data-testid="button-run-qa"
            >
              {t.runQA}
            </Button>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{t.qaResults}</h4>
              <div className="text-xs text-muted-foreground">{t.noIssues}</div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
