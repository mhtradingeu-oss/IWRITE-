import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Wand2, Edit, Trash2, Sparkles } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { useLanguage } from "@/components/LanguageProvider";
import { fillTemplate } from "@/lib/utils";
import type { StyleProfile } from "@shared/schema";
import { createAppMutation } from "@/lib/mutationHelper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const useCaseOptions = [
  "General",
  "Contract",
  "Policy",
  "Product Catalog",
  "Sales Offer",
  "Internal Guide",
  "Email",
  "Landing Page",
  "Support Chat",
];

const languageOptions = [
  { label: "English (US)", value: "en-US" },
  { label: "English (UK)", value: "en-UK" },
  { label: "Arabic (MSA)", value: "ar-MSA" },
  { label: "German", value: "de-DE" },
];

const toneOptions = ["very_formal", "professional", "neutral", "friendly", "energetic"];
const formalityOptions = ["formal", "semi_formal", "casual"];
const voiceOptions = [
  "first_person_singular",
  "first_person_plural",
  "third_person",
];
const purposeOptions = ["inform", "sell", "explain", "warn"];
const sentenceLengthOptions = ["short", "medium", "long"];
const structureOptions = ["bullets", "paragraphs", "mixed"];

const translations = {
  en: {
    styleProfiles: "Style Profiles",
    createNew: "Create Profile",
    noProfiles: "No style profiles yet. Create your first profile!",
    basicInfo: "Basic Info",
    toneAndVoice: "Tone & Voice",
    audienceAndPurpose: "Audience & Purpose",
    writingStyle: "Writing Style",
    wordsAndPhrases: "Words & Phrases",
    writingGuidelines: "Writing Guidelines",
    name: "Profile Name",
    useCase: "Use Case",
    language: "Language",
    region: "Region (optional)",
    tone: "Tone",
    formalityLevel: "Formality Level",
    voice: "Voice",
    targetAudience: "Target Audience",
    purpose: "Purpose",
    sentenceLengthPreference: "Sentence Length",
    structurePreference: "Structure Preference",
    allowEmojis: "Allow Emojis",
    allowSlang: "Allow Slang",
    useMarketingLanguage: "Use Marketing Language",
    requireDisclaimers: "Require Disclaimers",
    preferredPhrases: "Preferred Phrases (one per line)",
    forbiddenPhrases: "Forbidden Phrases (one per line)",
    guidelines: "Free-form Instructions",
    create: "Create",
    update: "Update",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirmDeleteProfileTitle: "Delete profile?",
    confirmDeleteProfileDescription: "Are you sure you want to delete {name}? This cannot be undone.",
    saveSuccess: "Style profile saved successfully",
    saveError: "Failed to save style profile",
    deleteSuccess: "Style profile deleted",
    deleteError: "Failed to delete style profile",
    generatePreview: "Generate Preview",
    preview: "Preview",
    enterName: "Enter profile name...",
    enterAudience: "e.g., B2B wholesalers, end consumers...",
  },
  ar: {
    styleProfiles: "ملفات التعريف النمطية",
    createNew: "إنشاء ملف تعريف",
    noProfiles: "لا توجد ملفات تعريف نمطية بعد.",
    basicInfo: "المعلومات الأساسية",
    toneAndVoice: "النبرة والصوت",
    audienceAndPurpose: "الجمهور والغرض",
    writingStyle: "أسلوب الكتابة",
    wordsAndPhrases: "الكلمات والعبارات",
    writingGuidelines: "إرشادات الكتابة",
    name: "اسم الملف",
    useCase: "حالة الاستخدام",
    language: "اللغة",
    region: "المنطقة (اختياري)",
    tone: "النبرة",
    formalityLevel: "مستوى الرسمية",
    voice: "الصوت",
    targetAudience: "الجمهور المستهدف",
    purpose: "الغرض",
    sentenceLengthPreference: "طول الجملة",
    structurePreference: "تفضيل الهيكل",
    allowEmojis: "السماح بالرموز التعبيرية",
    allowSlang: "السماح باللغة العامية",
    useMarketingLanguage: "استخدام لغة التسويق",
    requireDisclaimers: "مطلوب إخلاء المسؤولية",
    preferredPhrases: "العبارات المفضلة",
    forbiddenPhrases: "العبارات المحظورة",
    guidelines: "التعليمات الحرة",
    create: "إنشاء",
    update: "تحديث",
    cancel: "إلغاء",
    edit: "تحرير",
    delete: "حذف",
    confirmDeleteProfileTitle: "حذف الملف؟",
    confirmDeleteProfileDescription: "هل أنت متأكد أنك تريد حذف {name}? لا يمكن التراجع عن هذا الإجراء.",
    saveSuccess: "تم حفظ الملف النمطي بنجاح",
    saveError: "فشل حفظ الملف النمطي",
    deleteSuccess: "تم حذف الملف النمطي",
    deleteError: "فشل حذف الملف النمطي",
    generatePreview: "توليد معاينة",
    preview: "معاينة",
    enterName: "أدخل اسم الملف...",
    enterAudience: "مثلاً: تجار الجملة...",
  },
  de: {
    styleProfiles: "Stilprofile",
    createNew: "Profil erstellen",
    noProfiles: "Noch keine Stilprofile.",
    basicInfo: "Grundlegende Informationen",
    toneAndVoice: "Ton und Stimme",
    audienceAndPurpose: "Zielgruppe und Zweck",
    writingStyle: "Schreibstil",
    wordsAndPhrases: "Wörter und Phrasen",
    writingGuidelines: "Schreibrichtlinien",
    name: "Profilname",
    useCase: "Anwendungsfall",
    language: "Sprache",
    region: "Region (optional)",
    tone: "Ton",
    formalityLevel: "Formalitätsstufe",
    voice: "Stimme",
    targetAudience: "Zielgruppe",
    purpose: "Zweck",
    sentenceLengthPreference: "Satzlänge",
    structurePreference: "Strukturpräferenz",
    allowEmojis: "Emojis zulassen",
    allowSlang: "Slang zulassen",
    useMarketingLanguage: "Marketingsprache verwenden",
    requireDisclaimers: "Haftungsausschlüsse erforderlich",
    preferredPhrases: "Bevorzugte Phrasen",
    forbiddenPhrases: "Verbotene Phrasen",
    guidelines: "Kostenlose Anweisungen",
    create: "Erstellen",
    update: "Aktualisieren",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    delete: "Löschen",
    confirmDeleteProfileTitle: "Stilprofil löschen?",
    confirmDeleteProfileDescription: "Möchten Sie {name} wirklich löschen? Dies kann nicht rückgängig gemacht werden.",
    saveSuccess: "Stilprofil erfolgreich gespeichert",
    saveError: "Stilprofil konnte nicht gespeichert werden",
    deleteSuccess: "Stilprofil gelöscht",
    deleteError: "Stilprofil konnte nicht gelöscht werden",
    generatePreview: "Vorschau generieren",
    preview: "Vorschau",
    enterName: "Profilnamen eingeben...",
    enterAudience: "z.B. Großhandelshändler...",
  },
};

export default function StyleProfiles() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profilePendingDelete, setProfilePendingDelete] = useState<StyleProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<StyleProfile | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    useCase: "General",
    language: "en-US",
    region: "",
    tone: "professional",
    formalityLevel: "semi_formal",
    voice: "third_person",
    targetAudience: "",
    purpose: "",
    sentenceLengthPreference: "medium",
    structurePreference: "mixed",
    allowEmojis: false,
    allowSlang: false,
    useMarketingLanguage: false,
    requireDisclaimers: false,
    preferredPhrases: "",
    forbiddenPhrases: "",
    guidelines: "",
  });

  const { data: profiles, isLoading } = useQuery<StyleProfile[]>({
    queryKey: ["/api/style-profiles"],
  });

  const buildPayload = () => ({
    ...formData,
    allowEmojis: formData.allowEmojis ? 1 : 0,
    allowSlang: formData.allowSlang ? 1 : 0,
    useMarketingLanguage: formData.useMarketingLanguage ? 1 : 0,
    requireDisclaimers: formData.requireDisclaimers ? 1 : 0,
    preferredPhrases: formData.preferredPhrases
      .split("\n")
      .filter((p) => p.trim()),
    forbiddenPhrases: formData.forbiddenPhrases
      .split("\n")
      .filter((p) => p.trim()),
  });

  const createMutation = createAppMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/style-profiles", buildPayload());
    },
    onSuccessMessage: t.saveSuccess,
    onErrorMessage: t.saveError,
    invalidate: ["/api/style-profiles"],
    debugLabel: "create-style-profile",
    onSuccess: () => {
      setIsDialogOpen(false);
      resetForm();
      setPreview(null);
    },
  });

  const updateMutation = createAppMutation({
    mutationFn: async () => {
      return await apiRequest("PUT", `/api/style-profiles/${editingProfile?.id}`, buildPayload());
    },
    onSuccessMessage: t.saveSuccess,
    onErrorMessage: t.saveError,
    invalidate: ["/api/style-profiles"],
    debugLabel: "update-style-profile",
    onSuccess: () => {
      setIsDialogOpen(false);
      setEditingProfile(null);
      resetForm();
      setPreview(null);
    },
  });

  const deleteMutation = createAppMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/style-profiles/${id}`, null);
    },
    onSuccessMessage: t.deleteSuccess,
    onErrorMessage: t.deleteError,
    invalidate: ["/api/style-profiles"],
    debugLabel: "delete-style-profile",
  });

  const handleDeleteDialogChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setProfilePendingDelete(null);
    }
  };

  const deleteDialogDescription = fillTemplate(t.confirmDeleteProfileDescription, {
    name: profilePendingDelete?.name ?? t.styleProfiles,
  });

  const previewMutation = useMutation({
    mutationFn: async () => {
      if (!editingProfile) return "";
      const response = await apiRequest("POST", `/api/style-profiles/${editingProfile.id}/preview`, {});
      const data = (await response.json()) as { preview: string };
      return data.preview;
    },
    onSuccess: (data) => {
      setPreview(data);
    },
    onError: (error) => {
      toast({
        title: "Preview generation failed",
        description: "Could not generate style preview.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      useCase: "General",
      language: "en-US",
      region: "",
      tone: "professional",
      formalityLevel: "semi_formal",
      voice: "third_person",
      targetAudience: "",
      purpose: "",
      sentenceLengthPreference: "medium",
      structurePreference: "mixed",
      allowEmojis: false,
      allowSlang: false,
      useMarketingLanguage: false,
      requireDisclaimers: false,
      preferredPhrases: "",
      forbiddenPhrases: "",
      guidelines: "",
    });
    setPreview(null);
  };

  const handleEdit = (profile: StyleProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      useCase: profile.useCase || "General",
      language: profile.language || "en-US",
      region: profile.region || "",
      tone: profile.tone,
      formalityLevel: profile.formalityLevel || "semi_formal",
      voice: profile.voice,
      targetAudience: profile.targetAudience || "",
      purpose: profile.purpose || "",
      sentenceLengthPreference: profile.sentenceLengthPreference || "medium",
      structurePreference: profile.structurePreference || "mixed",
      allowEmojis: profile.allowEmojis === 1,
      allowSlang: profile.allowSlang === 1,
      useMarketingLanguage: profile.useMarketingLanguage === 1,
      requireDisclaimers: profile.requireDisclaimers === 1,
      preferredPhrases: (profile.preferredPhrases || []).join("\n"),
      forbiddenPhrases: (profile.forbiddenPhrases || []).join("\n"),
      guidelines: profile.guidelines || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
      if (editingProfile) {
        updateMutation.mutateAsync(undefined);
      } else {
        createMutation.mutateAsync(undefined);
      }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
            {t.styleProfiles}
          </h1>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProfile(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button data-testid="button-create-profile">
              <Plus className="h-4 w-4" />
              {t.createNew}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProfile ? t.edit : t.createNew}</DialogTitle>
              <DialogDescription>
                Define tone, voice, and writing guidelines for consistent content across use cases
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <section className="space-y-4">
                <h3 className="font-semibold text-sm">{t.basicInfo}</h3>
                <div className="grid gap-2">
                  <Label htmlFor="name">{t.name}</Label>
                  <Input
                    id="name"
                    placeholder={t.enterName}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    data-testid="input-profile-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="useCase">{t.useCase}</Label>
                    <Select
                      value={formData.useCase}
                      onValueChange={(value) =>
                        setFormData({ ...formData, useCase: value })
                      }
                    >
                      <SelectTrigger id="useCase" data-testid="select-use-case">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {useCaseOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="language">{t.language}</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) =>
                        setFormData({ ...formData, language: value })
                      }
                    >
                      <SelectTrigger id="language" data-testid="select-language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-sm">{t.toneAndVoice}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tone">{t.tone}</Label>
                    <Select
                      value={formData.tone}
                      onValueChange={(value) =>
                        setFormData({ ...formData, tone: value })
                      }
                    >
                      <SelectTrigger id="tone" data-testid="select-tone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {toneOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="formalityLevel">{t.formalityLevel}</Label>
                    <Select
                      value={formData.formalityLevel}
                      onValueChange={(value) =>
                        setFormData({ ...formData, formalityLevel: value })
                      }
                    >
                      <SelectTrigger id="formalityLevel" data-testid="select-formality">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formalityOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="voice">{t.voice}</Label>
                  <Select
                    value={formData.voice}
                    onValueChange={(value) =>
                      setFormData({ ...formData, voice: value })
                    }
                  >
                    <SelectTrigger id="voice" data-testid="select-voice">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-sm">{t.audienceAndPurpose}</h3>
                <div className="grid gap-2">
                  <Label htmlFor="targetAudience">{t.targetAudience}</Label>
                  <Input
                    id="targetAudience"
                    placeholder={t.enterAudience}
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAudience: e.target.value })
                    }
                    data-testid="input-target-audience"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="purpose">{t.purpose}</Label>
                  <Select
                    value={formData.purpose}
                    onValueChange={(value) =>
                      setFormData({ ...formData, purpose: value })
                    }
                  >
                    <SelectTrigger id="purpose" data-testid="select-purpose">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {purposeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-sm">{t.writingStyle}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sentenceLength">{t.sentenceLengthPreference}</Label>
                    <Select
                      value={formData.sentenceLengthPreference}
                      onValueChange={(value) =>
                        setFormData({ ...formData, sentenceLengthPreference: value })
                      }
                    >
                      <SelectTrigger id="sentenceLength" data-testid="select-sentence-length">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sentenceLengthOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="structure">{t.structurePreference}</Label>
                    <Select
                      value={formData.structurePreference}
                      onValueChange={(value) =>
                        setFormData({ ...formData, structurePreference: value })
                      }
                    >
                      <SelectTrigger id="structure" data-testid="select-structure">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {structureOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allowEmojis"
                      checked={formData.allowEmojis}
                      onChange={(e) =>
                        setFormData({ ...formData, allowEmojis: e.target.checked })
                      }
                      data-testid="checkbox-allow-emojis"
                    />
                    <Label htmlFor="allowEmojis" className="cursor-pointer">
                      {t.allowEmojis}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allowSlang"
                      checked={formData.allowSlang}
                      onChange={(e) =>
                        setFormData({ ...formData, allowSlang: e.target.checked })
                      }
                      data-testid="checkbox-allow-slang"
                    />
                    <Label htmlFor="allowSlang" className="cursor-pointer">
                      {t.allowSlang}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useMarketing"
                      checked={formData.useMarketingLanguage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          useMarketingLanguage: e.target.checked,
                        })
                      }
                      data-testid="checkbox-use-marketing"
                    />
                    <Label htmlFor="useMarketing" className="cursor-pointer">
                      {t.useMarketingLanguage}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requireDisclaimers"
                      checked={formData.requireDisclaimers}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requireDisclaimers: e.target.checked,
                        })
                      }
                      data-testid="checkbox-require-disclaimers"
                    />
                    <Label htmlFor="requireDisclaimers" className="cursor-pointer">
                      {t.requireDisclaimers}
                    </Label>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-sm">{t.wordsAndPhrases}</h3>
                <div className="grid gap-2">
                  <Label htmlFor="preferred">{t.preferredPhrases}</Label>
                  <Textarea
                    id="preferred"
                    value={formData.preferredPhrases}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredPhrases: e.target.value })
                    }
                    className="min-h-20"
                    data-testid="input-preferred-phrases"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="forbidden">{t.forbiddenPhrases}</Label>
                  <Textarea
                    id="forbidden"
                    value={formData.forbiddenPhrases}
                    onChange={(e) =>
                      setFormData({ ...formData, forbiddenPhrases: e.target.value })
                    }
                    className="min-h-20"
                    data-testid="input-forbidden-phrases"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-sm">{t.writingGuidelines}</h3>
                <div className="grid gap-2">
                  <Label htmlFor="guidelines">{t.guidelines}</Label>
                  <Textarea
                    id="guidelines"
                    value={formData.guidelines}
                    onChange={(e) =>
                      setFormData({ ...formData, guidelines: e.target.value })
                    }
                    className="min-h-24"
                    placeholder="Describe the writing style, preferences, and rules..."
                    data-testid="input-guidelines"
                  />
                </div>
              </section>

              {editingProfile && (
                <section className="space-y-4">
                  <h3 className="font-semibold text-sm">{t.preview}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => previewMutation.mutateAsync(undefined)}
                    disabled={previewMutation.isPending}
                    className="w-full"
                    data-testid="button-generate-preview"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {previewMutation.isPending ? "Generating..." : t.generatePreview}
                  </Button>
                  {preview && (
                    <Card className="bg-muted">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">{preview}</p>
                      </CardContent>
                    </Card>
                  )}
                </section>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingProfile(null);
                  resetForm();
                }}
                data-testid="button-cancel"
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !formData.name ||
                  !formData.tone ||
                  !formData.voice ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                data-testid="button-submit"
              >
                {editingProfile ? t.update : t.create}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : profiles && profiles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className="hover-elevate"
              data-testid={`card-profile-${profile.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {profile.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {profile.useCase || "General"} • {profile.language || "en"}
                    </CardDescription>
                  </div>
                  <Wand2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
                <div className="flex gap-1 flex-wrap mt-2">
                  <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                    {profile.tone}
                  </span>
                  <span className="inline-block bg-secondary/10 text-secondary-foreground text-xs px-2 py-1 rounded">
                    {profile.voice?.replace(/_/g, " ")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.targetAudience && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Audience:</span>{" "}
                    {profile.targetAudience}
                  </p>
                )}
                {profile.guidelines && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {profile.guidelines}
                  </p>
                )}
                <div className="flex items-center justify-end gap-1 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(profile)}
                    data-testid={`button-edit-${profile.id}`}
                  >
                    <Edit className="h-3 w-3" />
                    {t.edit}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setProfilePendingDelete(profile);
                      setDeleteDialogOpen(true);
                    }}
                    data-testid={`button-delete-${profile.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                    {t.delete}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wand2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">{t.noProfiles}</p>
          </CardContent>
        </Card>
      )}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        title={t.confirmDeleteProfileTitle}
        description={deleteDialogDescription}
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        tone="danger"
        onConfirm={async () => {
          if (!profilePendingDelete) {
            return;
          }
          await deleteMutation.mutateAsync(profilePendingDelete.id);
        }}
      />
    </div>
  );
}
