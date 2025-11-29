import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, FolderOpen, Tag, FileText, Trash2, Edit } from "lucide-react";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { useLanguage } from "@/components/LanguageProvider";
import { fillTemplate } from "@/lib/utils";
import { createAppMutation } from "@/lib/mutationHelper";

const translations = {
  en: {
    topics: "Topics",
    topicsDescription: "Organize and discover your documents by topics",
    createTopic: "Create Topic",
    editTopic: "Edit Topic",
    topicFormDescription: "Create topics with keywords to automatically organize your documents",
    topicName: "Topic Name",
    topicNamePlaceholder: "e.g., Medical Devices, Product Specifications",
    description: "Description",
    topicDescriptionPlaceholder: "Brief description of this topic...",
    keywords: "Keywords",
    keywordsPlaceholder: "medical, device, regulation, ISO",
    keywordsHint: "Comma-separated keywords for automatic document matching",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    success: "Success",
    error: "Error",
    topicCreated: "Topic created successfully",
    topicUpdated: "Topic updated successfully",
    topicDeleted: "Topic deleted successfully",
    saveSuccess: "Topic saved successfully",
    saveError: "Failed to save topic",
    deleteSuccess: "Topic deleted successfully",
    deleteError: "Failed to delete topic",
    deleteTopic: "Delete Topic",
    confirmDeleteTopicTitle: "Delete topic?",
    confirmDeleteTopicDescription: "Are you sure you want to delete {name}? This cannot be undone.",
    noTopics: "No topics yet",
    noTopicsDescription: "Create your first topic to start organizing your documents",
    createFirstTopic: "Create First Topic",
    documents: "documents",
  },
  ar: {
    topics: "المواضيع",
    topicsDescription: "نظم واكتشف مستنداتك حسب المواضيع",
    createTopic: "إنشاء موضوع",
    editTopic: "تحرير الموضوع",
    topicFormDescription: "أنشئ مواضيع بكلمات مفتاحية لتنظيم مستنداتك تلقائيًا",
    topicName: "اسم الموضوع",
    topicNamePlaceholder: "مثال: الأجهزة الطبية، مواصفات المنتجات",
    description: "الوصف",
    topicDescriptionPlaceholder: "وصف مختصر لهذا الموضوع...",
    keywords: "الكلمات المفتاحية",
    keywordsPlaceholder: "طبي، جهاز، تنظيم، ISO",
    keywordsHint: "كلمات مفتاحية مفصولة بفواصل للمطابقة التلقائية للمستندات",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جاري الحفظ...",
    success: "نجح",
    error: "خطأ",
    topicCreated: "تم إنشاء الموضوع بنجاح",
    topicUpdated: "تم تحديث الموضوع بنجاح",
    topicDeleted: "تم حذف الموضوع بنجاح",
    saveSuccess: "تم حفظ الموضوع بنجاح",
    saveError: "فشل حفظ الموضوع",
    deleteSuccess: "تم حذف الموضوع بنجاح",
    deleteError: "فشل حذف الموضوع",
    deleteTopic: "حذف الموضوع",
    confirmDeleteTopicTitle: "حذف الموضوع؟",
    confirmDeleteTopicDescription: "هل أنت متأكد أنك تريد حذف {name}? لا يمكن التراجع عن هذا الإجراء.",
    noTopics: "لا توجد مواضيع بعد",
    noTopicsDescription: "أنشئ موضوعك الأول لبدء تنظيم مستنداتك",
    createFirstTopic: "إنشاء الموضوع الأول",
    documents: "مستندات",
  },
  de: {
    topics: "Themen",
    topicsDescription: "Organisieren und entdecken Sie Ihre Dokumente nach Themen",
    createTopic: "Thema erstellen",
    editTopic: "Thema bearbeiten",
    topicFormDescription: "Erstellen Sie Themen mit Schlüsselwörtern zur automatischen Dokumentenorganisation",
    topicName: "Themenname",
    topicNamePlaceholder: "z.B. Medizinprodukte, Produktspezifikationen",
    description: "Beschreibung",
    topicDescriptionPlaceholder: "Kurze Beschreibung dieses Themas...",
    keywords: "Schlüsselwörter",
    keywordsPlaceholder: "medizinisch, Gerät, Regulierung, ISO",
    keywordsHint: "Durch Kommas getrennte Schlüsselwörter für automatische Dokumentzuordnung",
    cancel: "Abbrechen",
    save: "Speichern",
    saving: "Speichern...",
    success: "Erfolg",
    error: "Fehler",
    topicCreated: "Thema erfolgreich erstellt",
    topicUpdated: "Thema erfolgreich aktualisiert",
    topicDeleted: "Thema erfolgreich gelöscht",
    saveSuccess: "Thema erfolgreich gespeichert",
    saveError: "Thema konnte nicht gespeichert werden",
    deleteSuccess: "Thema erfolgreich gelöscht",
    deleteError: "Thema konnte nicht gelöscht werden",
    deleteTopic: "Thema löschen",
    confirmDeleteTopicTitle: "Thema löschen?",
    confirmDeleteTopicDescription: "Möchten Sie {name} wirklich löschen? Dies kann nicht rückgängig gemacht werden.",
    noTopics: "Noch keine Themen",
    noTopicsDescription: "Erstellen Sie Ihr erstes Thema, um Ihre Dokumente zu organisieren",
    createFirstTopic: "Erstes Thema erstellen",
    documents: "Dokumente",
  },
};

const topicSchema = z.object({
  name: z.string().min(1, "Topic name is required"),
  description: z.string().optional(),
  keywords: z.string().optional(),
});

type TopicFormData = z.infer<typeof topicSchema>;

interface Topic {
  id: string;
  name: string;
  description: string | null;
  keywords: string[] | null;
  documentCount?: number;
}

export default function Topics() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const t = (key: keyof typeof translations.en) => translations[language][key] || key;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicPendingDelete, setTopicPendingDelete] = useState<Topic | null>(null);

  const form = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      name: "",
      description: "",
      keywords: "",
    },
  });

  // Fetch all topics
  const { data: topics = [], isLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
  });

  // Create topic mutation
  const createMutation = createAppMutation({
    mutationFn: async (data: TopicFormData) => {
      const keywords = data.keywords
        ? data.keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [];

      const response = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          keywords,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccessMessage: t("saveSuccess"),
    onErrorMessage: t("saveError"),
    invalidate: ["/api/topics"],
    debugLabel: "create-topic",
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      form.reset();
    },
  });

  // Update topic mutation
  const updateMutation = createAppMutation({
    mutationFn: async ({ id, data }: { id: string; data: TopicFormData }) => {
      const keywords = data.keywords
        ? data.keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [];

      const response = await fetch(`/api/topics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          keywords,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccessMessage: t("saveSuccess"),
    onErrorMessage: t("saveError"),
    invalidate: ["/api/topics"],
    debugLabel: "update-topic",
    onSuccess: () => {
      setEditingTopic(null);
      form.reset();
    },
  });

  // Delete topic mutation
  const deleteMutation = createAppMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/topics/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccessMessage: t("deleteSuccess"),
    onErrorMessage: t("deleteError"),
    invalidate: ["/api/topics"],
    debugLabel: "delete-topic",
  });

  const handleSubmit = (data: TopicFormData) => {
    if (editingTopic) {
      updateMutation.mutate({ id: editingTopic.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    form.reset({
      name: topic.name,
      description: topic.description || "",
      keywords: topic.keywords?.join(", ") || "",
    });
  };

  const openDeleteDialog = (topic: Topic) => {
    setTopicPendingDelete(topic);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setTopicPendingDelete(null);
    }
  };

  const deleteDialogDescription = fillTemplate(t("confirmDeleteTopicDescription"), {
    name: topicPendingDelete?.name ?? t("topics"),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("topics")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("topicsDescription")}
          </p>
        </div>
        <Dialog 
          open={isCreateDialogOpen || !!editingTopic} 
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setEditingTopic(null);
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              data-testid="button-create-topic"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("createTopic")}
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-topic-form">
            <DialogHeader>
              <DialogTitle>
                {editingTopic ? t("editTopic") : t("createTopic")}
              </DialogTitle>
              <DialogDescription>
                {t("topicFormDescription")}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("topicName")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("topicNamePlaceholder")}
                          data-testid="input-topic-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("description")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("topicDescriptionPlaceholder")}
                          data-testid="input-topic-description"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("keywords")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("keywordsPlaceholder")}
                          data-testid="input-topic-keywords"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        {t("keywordsHint")}
                      </p>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingTopic(null);
                      form.reset();
                    }}
                    data-testid="button-cancel"
                  >
                    {t("cancel")}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    data-testid="button-save-topic"
                  >
                    {isPending ? t("saving") : t("save")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Topics Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse" data-testid={`skeleton-topic-${i}`}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : topics.length === 0 ? (
        <Card data-testid="empty-state">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("noTopics")}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t("noTopicsDescription")}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-topic">
              <Plus className="h-4 w-4 mr-2" />
              {t("createFirstTopic")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card 
              key={topic.id} 
              className="hover-elevate cursor-pointer"
              data-testid={`card-topic-${topic.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => navigate(`/topics/${topic.id}`)}>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      {topic.name}
                    </CardTitle>
                    {topic.description && (
                      <CardDescription className="mt-2 line-clamp-2">
                        {topic.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(topic);
                      }}
                      data-testid={`button-edit-topic-${topic.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(topic);
                      }}
                      data-testid={`button-delete-topic-${topic.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent onClick={() => navigate(`/topics/${topic.id}`)}>
                <div className="space-y-3">
                  {topic.keywords && topic.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {topic.keywords.slice(0, 5).map((keyword, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary"
                          data-testid={`badge-keyword-${idx}`}
                        >
                          {keyword}
                        </Badge>
                      ))}
                      {topic.keywords.length > 5 && (
                        <Badge variant="outline" data-testid="badge-more-keywords">
                          +{topic.keywords.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1" data-testid={`text-doc-count-${topic.id}`}>
                      <FileText className="h-4 w-4" />
                      <span>{topic.documentCount || 0} {t("documents")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        title={t("confirmDeleteTopicTitle")}
        description={deleteDialogDescription}
        confirmLabel={t("deleteTopic")}
        cancelLabel={t("cancel")}
        tone="danger"
        onConfirm={async () => {
          if (!topicPendingDelete) {
            return;
          }
          await deleteMutation.mutateAsync(topicPendingDelete.id);
        }}
      />
    </div>
  );
}
