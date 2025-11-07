import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Layout, Edit, Trash2, Palette } from "lucide-react";
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
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/components/LanguageProvider";
import type { Template } from "@shared/schema";

const translations = {
  en: {
    templates: "Templates",
    createNew: "Create Template",
    noTemplates: "No templates yet. Create your first template!",
    name: "Template Name",
    header: "Header",
    footer: "Footer",
    logoUrl: "Logo URL",
    primaryColor: "Primary Color",
    secondaryColor: "Secondary Color",
    create: "Create",
    update: "Update",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    enterName: "Enter template name...",
    enterHeader: "Enter header content...",
    enterFooter: "Enter footer content...",
    optional: "Optional",
  },
  ar: {
    templates: "القوالب",
    createNew: "إنشاء قالب",
    noTemplates: "لا توجد قوالب بعد. قم بإنشاء قالبك الأول!",
    name: "اسم القالب",
    header: "الرأس",
    footer: "التذييل",
    logoUrl: "رابط الشعار",
    primaryColor: "اللون الأساسي",
    secondaryColor: "اللون الثانوي",
    create: "إنشاء",
    update: "تحديث",
    cancel: "إلغاء",
    edit: "تحرير",
    delete: "حذف",
    enterName: "أدخل اسم القالب...",
    enterHeader: "أدخل محتوى الرأس...",
    enterFooter: "أدخل محتوى التذييل...",
    optional: "اختياري",
  },
  de: {
    templates: "Vorlagen",
    createNew: "Vorlage erstellen",
    noTemplates: "Noch keine Vorlagen. Erstellen Sie Ihre erste Vorlage!",
    name: "Vorlagenname",
    header: "Kopfzeile",
    footer: "Fußzeile",
    logoUrl: "Logo-URL",
    primaryColor: "Primärfarbe",
    secondaryColor: "Sekundärfarbe",
    create: "Erstellen",
    update: "Aktualisieren",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    delete: "Löschen",
    enterName: "Vorlagennamen eingeben...",
    enterHeader: "Kopfzeileninhalt eingeben...",
    enterFooter: "Fußzeileninhalt eingeben...",
    optional: "Optional",
  },
};

export default function Templates() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    header: "",
    footer: "",
    logoUrl: "",
    brandColors: { primary: "#1E40AF", secondary: "#F59E0B" },
  });

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/templates", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Template created",
        description: "Your template has been saved.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PUT", `/api/templates/${editingTemplate?.id}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
      toast({
        title: "Template updated",
        description: "Your changes have been saved.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/templates/${id}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template deleted",
        description: "The template has been removed.",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      header: "",
      footer: "",
      logoUrl: "",
      brandColors: { primary: "#1E40AF", secondary: "#F59E0B" },
    });
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      header: template.header || "",
      footer: template.footer || "",
      logoUrl: template.logoUrl || "",
      brandColors: template.brandColors || { primary: "#1E40AF", secondary: "#F59E0B" },
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingTemplate) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">{t.templates}</h1>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingTemplate(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button data-testid="button-create-template">
              <Plus className="h-4 w-4" />
              {t.createNew}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? t.edit : t.createNew}</DialogTitle>
              <DialogDescription>
                Define headers, footers, and branding for your documents
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  placeholder={t.enterName}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-template-name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="header">{t.header} ({t.optional})</Label>
                <Textarea
                  id="header"
                  placeholder={t.enterHeader}
                  value={formData.header}
                  onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                  className="min-h-20"
                  data-testid="input-header"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="footer">{t.footer} ({t.optional})</Label>
                <Textarea
                  id="footer"
                  placeholder={t.enterFooter}
                  value={formData.footer}
                  onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                  className="min-h-20"
                  data-testid="input-footer"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="logoUrl">{t.logoUrl} ({t.optional})</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  data-testid="input-logo-url"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="primaryColor">{t.primaryColor}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.brandColors.primary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brandColors: { ...formData.brandColors, primary: e.target.value },
                        })
                      }
                      className="w-16 h-10"
                      data-testid="input-primary-color"
                    />
                    <Input
                      type="text"
                      value={formData.brandColors.primary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brandColors: { ...formData.brandColors, primary: e.target.value },
                        })
                      }
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="secondaryColor">{t.secondaryColor}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.brandColors.secondary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brandColors: { ...formData.brandColors, secondary: e.target.value },
                        })
                      }
                      className="w-16 h-10"
                      data-testid="input-secondary-color"
                    />
                    <Input
                      type="text"
                      value={formData.brandColors.secondary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brandColors: { ...formData.brandColors, secondary: e.target.value },
                        })
                      }
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
                data-testid="button-cancel"
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit"
              >
                {editingTemplate ? t.update : t.create}
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
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover-elevate" data-testid={`card-template-${template.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{template.name}</CardTitle>
                    <CardDescription className="text-xs">
                      Template • {new Date(template.createdAt).toLocaleDateString(language)}
                    </CardDescription>
                  </div>
                  <Layout className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {template.brandColors && (
                  <div className="flex items-center gap-2">
                    <Palette className="h-3 w-3 text-muted-foreground" />
                    <div className="flex gap-1">
                      <div
                        className="h-6 w-6 rounded border border-border"
                        style={{ backgroundColor: template.brandColors.primary }}
                      />
                      <div
                        className="h-6 w-6 rounded border border-border"
                        style={{ backgroundColor: template.brandColors.secondary }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    data-testid={`button-edit-${template.id}`}
                  >
                    <Edit className="h-3 w-3" />
                    {t.edit}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(template.id)}
                    data-testid={`button-delete-${template.id}`}
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
            <Layout className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">{t.noTemplates}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
