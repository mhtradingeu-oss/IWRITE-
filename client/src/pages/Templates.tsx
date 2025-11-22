import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Layout, Edit, Trash2, Palette, Copy, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
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
    uploadLogo: "Upload Logo",
    useLogo: "Or paste a logo URL",
    primaryColor: "Primary Color",
    secondaryColor: "Secondary Color",
    create: "Create",
    update: "Update",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    duplicate: "Duplicate",
    enterName: "Enter template name...",
    enterHeader: "Enter header content...",
    enterFooter: "Enter footer content...",
    optional: "Optional",
    preview: "Preview",
    sampleContent: "Sample document content...",
    colorPickerLabel: "Color picker",
    hexColorLabel: "HEX Color",
    createdDate: "Created",
    template: "Template",
    editTemplate: "Edit Template",
    newTemplate: "New Template",
  },
  ar: {
    templates: "القوالب",
    createNew: "إنشاء قالب",
    noTemplates: "لا توجد قوالب بعد. قم بإنشاء قالبك الأول!",
    name: "اسم القالب",
    header: "الرأس",
    footer: "التذييل",
    logoUrl: "رابط الشعار",
    uploadLogo: "تحميل الشعار",
    useLogo: "أو لصق رابط الشعار",
    primaryColor: "اللون الأساسي",
    secondaryColor: "اللون الثانوي",
    create: "إنشاء",
    update: "تحديث",
    cancel: "إلغاء",
    edit: "تحرير",
    delete: "حذف",
    duplicate: "نسخ",
    enterName: "أدخل اسم القالب...",
    enterHeader: "أدخل محتوى الرأس...",
    enterFooter: "أدخل محتوى التذييل...",
    optional: "اختياري",
    preview: "معاينة",
    sampleContent: "نموذج محتوى المستند...",
    colorPickerLabel: "منتقي اللون",
    hexColorLabel: "لون HEX",
    createdDate: "تم الإنشاء",
    template: "القالب",
    editTemplate: "تحرير القالب",
    newTemplate: "قالب جديد",
  },
  de: {
    templates: "Vorlagen",
    createNew: "Vorlage erstellen",
    noTemplates: "Noch keine Vorlagen. Erstellen Sie Ihre erste Vorlage!",
    name: "Vorlagenname",
    header: "Kopfzeile",
    footer: "Fußzeile",
    logoUrl: "Logo-URL",
    uploadLogo: "Logo hochladen",
    useLogo: "Oder geben Sie eine Logo-URL ein",
    primaryColor: "Primärfarbe",
    secondaryColor: "Sekundärfarbe",
    create: "Erstellen",
    update: "Aktualisieren",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    delete: "Löschen",
    duplicate: "Duplizieren",
    enterName: "Vorlagennamen eingeben...",
    enterHeader: "Kopfzeileninhalt eingeben...",
    enterFooter: "Fußzeileninhalt eingeben...",
    optional: "Optional",
    preview: "Vorschau",
    sampleContent: "Beispielinhalt des Dokuments...",
    colorPickerLabel: "Farbwähler",
    hexColorLabel: "HEX-Farbe",
    createdDate: "Erstellt",
    template: "Vorlage",
    editTemplate: "Vorlage bearbeiten",
    newTemplate: "Neue Vorlage",
  },
};

interface PreviewProps {
  template: {
    name: string;
    header: string;
    footer: string;
    logoUrl: string;
    brandColors: { primary: string; secondary: string };
  };
  language: string;
}

function TemplatePreview({ template, language }: PreviewProps) {
  const t = translations[language as keyof typeof translations];
  const isRTL = language === "ar";

  return (
    <div className="bg-muted/30 rounded-lg p-6 flex flex-col h-full overflow-y-auto">
      <h3 className="text-sm font-semibold mb-4">{t.preview}</h3>

      {/* Template Preview Card */}
      <Card className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        {/* Header Section */}
        <div className="p-6 border-b" style={{ backgroundColor: template.brandColors.primary }}>
          <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            {template.logoUrl && (
              <img
                src={template.logoUrl}
                alt="Logo"
                className="h-12 w-12 object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            )}
            {!template.logoUrl && (
              <div className="h-12 w-12 bg-white/20 rounded flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-white/40" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {template.header && (
                <p
                  className="text-sm font-semibold text-white mb-1 break-words"
                  style={{ textAlign: isRTL ? "right" : "left" }}
                >
                  {template.header}
                </p>
              )}
              <p
                className="text-xs text-white/70"
                style={{ textAlign: isRTL ? "right" : "left" }}
              >
                {template.name}
              </p>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="p-6 flex-1">
          <div
            className="space-y-3"
            style={{ textAlign: isRTL ? "right" : "left", direction: isRTL ? "rtl" : "ltr" }}
          >
            <h2 className="font-bold text-lg" style={{ color: template.brandColors.primary }}>
              Document Title
            </h2>
            <p className="text-sm text-muted-foreground">{t.sampleContent}</p>
            <div className="pt-3 space-y-2">
              <h3 className="font-semibold text-sm" style={{ color: template.brandColors.secondary }}>
                Section Heading
              </h3>
              <p className="text-xs text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        {template.footer && (
          <div
            className="px-6 py-3 border-t bg-muted/50 text-xs text-muted-foreground"
            style={{ textAlign: isRTL ? "right" : "left", direction: isRTL ? "rtl" : "ltr" }}
          >
            {template.footer}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function Templates() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const { toast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
      setIsDrawerOpen(false);
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
      setIsDrawerOpen(false);
      setEditingTemplate(null);
      resetForm();
      toast({
        title: "Template updated",
        description: "Your changes have been saved.",
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (template: Template) => {
      const newData = {
        name: `${template.name} (Copy)`,
        header: template.header,
        footer: template.footer,
        logoUrl: template.logoUrl,
        brandColors: template.brandColors,
      };
      return await apiRequest("POST", "/api/templates", newData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template duplicated",
        description: "Your template has been copied.",
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
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }

    if (editingTemplate) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingTemplate(null);
    resetForm();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
            {t.templates}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Design and manage your document templates with live preview
          </p>
        </div>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button onClick={handleCreate} data-testid="button-create-template">
              <Plus className="h-4 w-4" />
              {t.createNew}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[90vh] p-0 flex flex-col">
            <DrawerHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DrawerTitle>{editingTemplate ? t.editTemplate : t.newTemplate}</DrawerTitle>
                  <DrawerDescription>
                    Configure headers, footers, colors, and preview changes in real-time
                  </DrawerDescription>
                </div>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" onClick={handleCloseDrawer}>
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            {/* Split View: Form and Preview */}
            <div className="flex-1 flex gap-6 p-6 overflow-hidden">
              {/* Left Panel: Form */}
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-6 max-w-xl">
                  {/* Template Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-semibold">
                      {t.name}
                    </Label>
                    <Input
                      id="name"
                      placeholder={t.enterName}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="input-template-name"
                      className="text-base"
                    />
                  </div>

                  {/* Logo Section */}
                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Logo
                    </Label>
                    <p className="text-xs text-muted-foreground">{t.uploadLogo}</p>
                    <div className="p-3 border-2 border-dashed rounded-lg flex items-center justify-center min-h-24 bg-muted/30">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo preview"
                          className="h-20 w-20 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">{t.useLogo}</p>
                        </div>
                      )}
                    </div>
                    <Input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      data-testid="input-logo-url"
                      className="text-sm"
                    />
                  </div>

                  {/* Header */}
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="header" className="text-base font-semibold">
                      {t.header}
                      <span className="text-xs text-muted-foreground ml-2">({t.optional})</span>
                    </Label>
                    <Textarea
                      id="header"
                      placeholder={t.enterHeader}
                      value={formData.header}
                      onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                      data-testid="input-header"
                      className="min-h-24"
                    />
                    <p className="text-xs text-muted-foreground">
                      Displayed at the top of your documents
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="space-y-2">
                    <Label htmlFor="footer" className="text-base font-semibold">
                      {t.footer}
                      <span className="text-xs text-muted-foreground ml-2">({t.optional})</span>
                    </Label>
                    <Textarea
                      id="footer"
                      placeholder={t.enterFooter}
                      value={formData.footer}
                      onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                      data-testid="input-footer"
                      className="min-h-24"
                    />
                    <p className="text-xs text-muted-foreground">
                      Displayed at the bottom of your documents
                    </p>
                  </div>

                  {/* Colors */}
                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Brand Colors
                    </Label>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Primary Color */}
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor" className="text-sm">
                          {t.primaryColor}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={formData.brandColors.primary}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                brandColors: {
                                  ...formData.brandColors,
                                  primary: e.target.value,
                                },
                              })
                            }
                            data-testid="input-primary-color"
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            type="text"
                            value={formData.brandColors.primary}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                brandColors: {
                                  ...formData.brandColors,
                                  primary: e.target.value,
                                },
                              })
                            }
                            className="flex-1 font-mono text-sm"
                            placeholder="#000000"
                          />
                        </div>
                      </div>

                      {/* Secondary Color */}
                      <div className="space-y-2">
                        <Label htmlFor="secondaryColor" className="text-sm">
                          {t.secondaryColor}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={formData.brandColors.secondary}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                brandColors: {
                                  ...formData.brandColors,
                                  secondary: e.target.value,
                                },
                              })
                            }
                            data-testid="input-secondary-color"
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            type="text"
                            value={formData.brandColors.secondary}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                brandColors: {
                                  ...formData.brandColors,
                                  secondary: e.target.value,
                                },
                              })
                            }
                            className="flex-1 font-mono text-sm"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Preview */}
              <div className="flex-1 hidden lg:flex">
                <TemplatePreview template={formData} language={language} />
              </div>
            </div>

            {/* Actions */}
            <div className="border-t p-6 flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDrawer} data-testid="button-cancel">
                {t.cancel}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !formData.name ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                data-testid="button-submit"
              >
                {editingTemplate ? t.update : t.create}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Templates Grid */}
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
            <Card
              key={template.id}
              className="hover-elevate flex flex-col transition-all"
              data-testid={`card-template-${template.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{template.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {t.template} • {new Date(template.createdAt).toLocaleDateString(language)}
                    </CardDescription>
                  </div>
                  <Layout className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </CardHeader>

              <CardContent className="space-y-3 flex-1">
                {/* Logo Thumbnail */}
                {template.logoUrl && (
                  <div className="p-2 bg-muted rounded">
                    <img
                      src={template.logoUrl}
                      alt={template.name}
                      className="h-12 w-12 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Color Dots */}
                {template.brandColors && (
                  <div className="flex items-center gap-2">
                    <Palette className="h-3 w-3 text-muted-foreground" />
                    <div className="flex gap-1">
                      <div
                        className="h-6 w-6 rounded border border-border"
                        style={{ backgroundColor: template.brandColors.primary }}
                        title={template.brandColors.primary}
                      />
                      <div
                        className="h-6 w-6 rounded border border-border"
                        style={{ backgroundColor: template.brandColors.secondary }}
                        title={template.brandColors.secondary}
                      />
                    </div>
                  </div>
                )}

                {/* Text Snippet */}
                {(template.header || template.footer) && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.header || template.footer}
                  </p>
                )}
              </CardContent>

              {/* Card Actions */}
              <div className="border-t p-3 flex gap-1 justify-between">
                <div className="flex gap-1">
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
                    onClick={() => duplicateMutation.mutate(template)}
                    data-testid={`button-duplicate-${template.id}`}
                  >
                    <Copy className="h-3 w-3" />
                    {t.duplicate}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteMutation.mutate(template.id)}
                  data-testid={`button-delete-${template.id}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
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
