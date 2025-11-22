import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Layout, Edit, Trash2, Palette, Copy, X, Image as ImageIcon, Type } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/components/LanguageProvider";
import type { Template, LogoPosition, LogoSize, FontFamily } from "@shared/schema";
import { logoPositions, logoSizes, fontFamilies } from "@shared/schema";

const FONT_FAMILY_MAP: Record<FontFamily, { name: string; css: string; preview: string }> = {
  inter: { name: "Inter", css: "font-sans", preview: "Aa" },
  georgia: { name: "Georgia", css: "font-serif", preview: "Aa" },
  cairo: { name: "Cairo", css: "font-sans", preview: "أب" },
  "noto-sans-arabic": { name: "Noto Sans Arabic", css: "font-sans", preview: "أب" },
  "system-ui": { name: "System UI", css: "font-system", preview: "Aa" },
};

const LOGO_SIZE_MAP: Record<LogoSize, number> = {
  small: 40,
  medium: 64,
  large: 96,
};

const translations = {
  en: {
    templates: "Templates",
    createNew: "Create Template",
    noTemplates: "No templates yet. Create your first template!",
    name: "Template Name",
    header: "Header",
    footer: "Footer",
    logo: "Logo",
    logoUrl: "Logo URL",
    uploadLogo: "Upload Logo",
    useLogo: "Or paste a logo URL",
    logoPosition: "Logo Position",
    logoSize: "Logo Size",
    topLeft: "Top Left",
    topCenter: "Top Center",
    topRight: "Top Right",
    headerBar: "In Header Bar",
    side: "Side",
    small: "Small",
    medium: "Medium",
    large: "Large",
    typography: "Typography",
    headingFont: "Heading Font",
    bodyFont: "Body Font",
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
    logo: "الشعار",
    logoUrl: "رابط الشعار",
    uploadLogo: "تحميل الشعار",
    useLogo: "أو لصق رابط الشعار",
    logoPosition: "موضع الشعار",
    logoSize: "حجم الشعار",
    topLeft: "أعلى اليسار",
    topCenter: "أعلى المركز",
    topRight: "أعلى اليمين",
    headerBar: "في شريط الرأس",
    side: "على الجانب",
    small: "صغير",
    medium: "متوسط",
    large: "كبير",
    typography: "الخطوط",
    headingFont: "خط العناوين",
    bodyFont: "خط النص",
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
    logo: "Logo",
    logoUrl: "Logo-URL",
    uploadLogo: "Logo hochladen",
    useLogo: "Oder geben Sie eine Logo-URL ein",
    logoPosition: "Logo-Position",
    logoSize: "Logogröße",
    topLeft: "Oben links",
    topCenter: "Oben Mitte",
    topRight: "Oben rechts",
    headerBar: "In Kopfzeilenleiste",
    side: "Seite",
    small: "Klein",
    medium: "Mittel",
    large: "Groß",
    typography: "Typografie",
    headingFont: "Überschriftenschriftart",
    bodyFont: "Body-Schriftart",
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
    createdDate: "Erstellt",
    template: "Vorlage",
    editTemplate: "Vorlage bearbeiten",
    newTemplate: "Neue Vorlage",
  },
};

interface TemplateFormData {
  name: string;
  header: string;
  footer: string;
  logoUrl: string;
  logoPosition: LogoPosition;
  logoSize: LogoSize;
  headingFontFamily: FontFamily;
  bodyFontFamily: FontFamily;
  brandColors: { primary: string; secondary: string };
}

interface LogoFileInfo {
  name: string;
  size: number;
  extension: string;
}

interface TemplateFormState extends TemplateFormData {
  uploadError?: string;
  logoFileInfo?: LogoFileInfo;
}

interface PreviewProps {
  template: TemplateFormData;
  language: string;
}

function TemplatePreview({ template, language }: PreviewProps) {
  const t = translations[language as keyof typeof translations];
  const isRTL = language === "ar";
  const logoPixelSize = LOGO_SIZE_MAP[template.logoSize];
  const headingFont = FONT_FAMILY_MAP[template.headingFontFamily];
  const bodyFont = FONT_FAMILY_MAP[template.bodyFontFamily];
  const primaryColor = template.brandColors.primary || "#1E40AF";

  const renderLogo = () => {
    if (!template.logoUrl) return null;
    return (
      <img
        src={template.logoUrl}
        alt="Logo"
        className="object-cover rounded"
        style={{ height: `${logoPixelSize}px`, width: `${logoPixelSize}px` }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
    );
  };

  return (
    <div className="bg-muted/30 rounded-lg p-6 flex flex-col h-full overflow-y-auto">
      <h3 className="text-sm font-semibold mb-4">{t.preview}</h3>
      <div className="flex-1 flex flex-col overflow-hidden rounded-lg shadow-lg" style={{ backgroundColor: "#ffffff" }}>
        {/* Header Section - varies by logo position */}
        <div className="p-6 border-b" style={{ backgroundColor: primaryColor }}>
          {template.logoPosition === "header_bar" && (
            <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              {renderLogo() || (
                <div
                  className="bg-white/20 rounded flex items-center justify-center"
                  style={{ height: `${logoPixelSize}px`, width: `${logoPixelSize}px` }}
                >
                  <ImageIcon className="h-6 w-6 text-white/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {template.header && (
                  <p
                    className="text-sm font-semibold text-white mb-1 break-words"
                    style={{
                      textAlign: isRTL ? "right" : "left",
                      fontFamily: headingFont.css,
                    }}
                  >
                    {template.header}
                  </p>
                )}
                <p
                  className="text-xs text-white/70"
                  style={{
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: bodyFont.css,
                  }}
                >
                  {template.name}
                </p>
              </div>
            </div>
          )}

          {["top_left", "top_center", "top_right"].includes(template.logoPosition) && (
            <div className="space-y-2">
              <div
                className={`flex ${
                  template.logoPosition === "top_left"
                    ? isRTL
                      ? "justify-end"
                      : "justify-start"
                    : template.logoPosition === "top_right"
                      ? isRTL
                        ? "justify-start"
                        : "justify-end"
                      : "justify-center"
                } mb-4`}
              >
                {renderLogo() || (
                  <div
                    className="bg-white/20 rounded flex items-center justify-center"
                    style={{ height: `${logoPixelSize}px`, width: `${logoPixelSize}px` }}
                  >
                    <ImageIcon className="h-6 w-6 text-white/40" />
                  </div>
                )}
              </div>
              {template.header && (
                <p
                  className="text-sm font-semibold text-white mb-1 break-words"
                  style={{
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: headingFont.css,
                  }}
                >
                  {template.header}
                </p>
              )}
              <p
                className="text-xs text-white/70"
                style={{
                  textAlign: isRTL ? "right" : "left",
                  fontFamily: bodyFont.css,
                }}
              >
                {template.name}
              </p>
            </div>
          )}

          {template.logoPosition === "side" && (
            <div className={`flex gap-4 items-start ${isRTL ? "flex-row-reverse" : ""}`}>
              {renderLogo() || (
                <div
                  className="bg-white/20 rounded flex-shrink-0 flex items-center justify-center"
                  style={{ height: `${logoPixelSize * 0.7}px`, width: `${logoPixelSize * 0.7}px` }}
                >
                  <ImageIcon className="h-5 w-5 text-white/40" />
                </div>
              )}
              <div>
                {template.header && (
                  <p
                    className="text-sm font-semibold text-white mb-1 break-words"
                    style={{ fontFamily: headingFont.css }}
                  >
                    {template.header}
                  </p>
                )}
                <p className="text-xs text-white/70" style={{ fontFamily: bodyFont.css }}>
                  {template.name}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Body Section */}
        <div className="p-6 flex-1" style={{ backgroundColor: "#ffffff" }}>
          <div
            className="space-y-3"
            style={{
              textAlign: isRTL ? "right" : "left",
              direction: isRTL ? "rtl" : "ltr",
              fontFamily: bodyFont.css,
              color: "#111827",
            }}
          >
            <h2
              className="font-bold text-lg"
              style={{
                color: primaryColor,
                fontFamily: headingFont.css,
              }}
            >
              Document Title
            </h2>
            <p className="text-sm" style={{ color: "#6b7280" }}>{t.sampleContent}</p>
            <div className="pt-3 space-y-2">
              <h3
                className="font-semibold text-sm"
                style={{
                  color: template.brandColors.secondary,
                  fontFamily: headingFont.css,
                }}
              >
                Section Heading
              </h3>
              <p className="text-xs" style={{ color: "#6b7280" }}>
                {t.sampleContent || "Professional sample content demonstrating template styling and formatting."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        {template.footer && (
          <div
            className="px-6 py-3 border-t text-xs"
            style={{
              backgroundColor: "#f9fafb",
              textAlign: isRTL ? "right" : "left",
              direction: isRTL ? "rtl" : "ltr",
              fontFamily: bodyFont.css,
              color: "#6b7280",
            }}
          >
            {template.footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Templates() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const { toast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<TemplateFormState>({
    name: "",
    header: "",
    footer: "",
    logoUrl: "",
    logoPosition: "header_bar",
    logoSize: "medium",
    headingFontFamily: "inter",
    bodyFontFamily: "inter",
    brandColors: { primary: "#1E40AF", secondary: "#F59E0B" },
    uploadError: undefined,
    logoFileInfo: undefined,
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
        logoPosition: template.logoPosition || "header_bar",
        logoSize: template.logoSize || "medium",
        headingFontFamily: template.headingFontFamily || "inter",
        bodyFontFamily: template.bodyFontFamily || "inter",
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
      logoPosition: "header_bar",
      logoSize: "medium",
      headingFontFamily: "inter",
      bodyFontFamily: "inter",
      brandColors: { primary: "#1E40AF", secondary: "#F59E0B" },
      uploadError: undefined,
      logoFileInfo: undefined,
    });
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      header: template.header || "",
      footer: template.footer || "",
      logoUrl: template.logoUrl || "",
      logoPosition: template.logoPosition || "header_bar",
      logoSize: template.logoSize || "medium",
      headingFontFamily: template.headingFontFamily || "inter",
      bodyFontFamily: template.bodyFontFamily || "inter",
      brandColors: template.brandColors || { primary: "#1E40AF", secondary: "#F59E0B" },
      uploadError: undefined,
      logoFileInfo: undefined,
    });
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    resetForm();
    setIsDrawerOpen(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      const errorMsg = "Please upload an image file (PNG, JPG, SVG, etc.)";
      setFormData({ ...formData, uploadError: errorMsg });
      toast({
        title: "Invalid file",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setFormData({ ...formData, uploadError: undefined });
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("files", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const uploadedFile = data[0];
        // Use the file serving endpoint to get the image URL
        const logoUrl = `/api/uploads/${uploadedFile.id}/file`;
        
        // Extract file extension
        const extension = file.name.split('.').pop()?.toUpperCase() || "UNKNOWN";
        
        const logoFileInfo: LogoFileInfo = {
          name: file.name,
          size: file.size,
          extension: extension,
        };
        
        setFormData({ ...formData, logoUrl, uploadError: undefined, logoFileInfo });
        toast({
          title: "Logo uploaded",
          description: `${file.name} (${formatFileSize(file.size)}) uploaded successfully.`,
        });
      } else {
        throw new Error("No files uploaded");
      }
    } catch (error: any) {
      const errorMsg = error.message || "Failed to upload logo. Please try again.";
      setFormData({ ...formData, uploadError: errorMsg });
      toast({
        title: "Upload failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
                      {t.logo}
                    </Label>
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
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleLogoUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full"
                      data-testid="button-upload-logo"
                    >
                      {isUploading ? "Uploading..." : t.uploadLogo}
                    </Button>
                    {formData.uploadError && (
                      <p className="text-sm text-destructive" data-testid="error-logo-upload">
                        {formData.uploadError}
                      </p>
                    )}
                    {formData.logoFileInfo && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded flex justify-between items-center">
                        <span data-testid="logo-file-info">
                          <strong>File:</strong> {formData.logoFileInfo.name}
                        </span>
                        <span className="flex gap-3">
                          <span><strong>Size:</strong> {formatFileSize(formData.logoFileInfo.size)}</span>
                          <span><strong>Type:</strong> .{formData.logoFileInfo.extension}</span>
                        </span>
                      </div>
                    )}
                    <Input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value, uploadError: undefined })}
                      data-testid="input-logo-url"
                      className="text-sm"
                    />
                  </div>

                  {/* Logo Controls */}
                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-base font-semibold">{t.logoPosition}</Label>
                    <Select
                      value={formData.logoPosition}
                      onValueChange={(value) =>
                        setFormData({ ...formData, logoPosition: value as LogoPosition })
                      }
                    >
                      <SelectTrigger data-testid="select-logo-position">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header_bar">{t.headerBar}</SelectItem>
                        <SelectItem value="top_left">{t.topLeft}</SelectItem>
                        <SelectItem value="top_center">{t.topCenter}</SelectItem>
                        <SelectItem value="top_right">{t.topRight}</SelectItem>
                        <SelectItem value="side">{t.side}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Label className="text-base font-semibold">{t.logoSize}</Label>
                    <Select
                      value={formData.logoSize}
                      onValueChange={(value) =>
                        setFormData({ ...formData, logoSize: value as LogoSize })
                      }
                    >
                      <SelectTrigger data-testid="select-logo-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">{t.small}</SelectItem>
                        <SelectItem value="medium">{t.medium}</SelectItem>
                        <SelectItem value="large">{t.large}</SelectItem>
                      </SelectContent>
                    </Select>
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
                      className="min-h-20"
                    />
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
                      className="min-h-20"
                    />
                  </div>

                  {/* Typography */}
                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      {t.typography}
                    </Label>

                    <div className="space-y-2">
                      <Label htmlFor="headingFont" className="text-sm">
                        {t.headingFont}
                      </Label>
                      <Select
                        value={formData.headingFontFamily}
                        onValueChange={(value) =>
                          setFormData({ ...formData, headingFontFamily: value as FontFamily })
                        }
                      >
                        <SelectTrigger data-testid="select-heading-font">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontFamilies.map((font) => (
                            <SelectItem key={font} value={font}>
                              {FONT_FAMILY_MAP[font].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bodyFont" className="text-sm">
                        {t.bodyFont}
                      </Label>
                      <Select
                        value={formData.bodyFontFamily}
                        onValueChange={(value) =>
                          setFormData({ ...formData, bodyFontFamily: value as FontFamily })
                        }
                      >
                        <SelectTrigger data-testid="select-body-font">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontFamilies.map((font) => (
                            <SelectItem key={font} value={font}>
                              {FONT_FAMILY_MAP[font].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      {t.primaryColor}
                    </Label>

                    <div className="grid grid-cols-2 gap-4">
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

                {(template.header || template.footer) && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.header || template.footer}
                  </p>
                )}
              </CardContent>

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
