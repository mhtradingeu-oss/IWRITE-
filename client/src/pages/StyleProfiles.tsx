import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Wand2, Edit, Trash2 } from "lucide-react";
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
import type { StyleProfile } from "@shared/schema";

const translations = {
  en: {
    styleProfiles: "Style Profiles",
    createNew: "Create Profile",
    noProfiles: "No style profiles yet. Create your first profile!",
    name: "Profile Name",
    tone: "Tone",
    voice: "Voice",
    guidelines: "Writing Guidelines",
    create: "Create",
    update: "Update",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    enterName: "Enter profile name...",
    enterTone: "e.g., Professional, Casual, Formal...",
    enterVoice: "e.g., First Person, Third Person, Active...",
    enterGuidelines: "Describe the writing style, preferences, and rules...",
  },
  ar: {
    styleProfiles: "ملفات التعريف النمطية",
    createNew: "إنشاء ملف تعريف",
    noProfiles: "لا توجد ملفات تعريف نمطية بعد. قم بإنشاء أول ملف لك!",
    name: "اسم الملف",
    tone: "النبرة",
    voice: "الصوت",
    guidelines: "إرشادات الكتابة",
    create: "إنشاء",
    update: "تحديث",
    cancel: "إلغاء",
    edit: "تحرير",
    delete: "حذف",
    enterName: "أدخل اسم الملف...",
    enterTone: "مثلاً: رسمي، غير رسمي، احترافي...",
    enterVoice: "مثلاً: ضمير المتكلم، ضمير الغائب، نشط...",
    enterGuidelines: "صف أسلوب الكتابة والتفضيلات والقواعد...",
  },
  de: {
    styleProfiles: "Stilprofile",
    createNew: "Profil erstellen",
    noProfiles: "Noch keine Stilprofile. Erstellen Sie Ihr erstes Profil!",
    name: "Profilname",
    tone: "Ton",
    voice: "Stimme",
    guidelines: "Schreibrichtlinien",
    create: "Erstellen",
    update: "Aktualisieren",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    delete: "Löschen",
    enterName: "Profilnamen eingeben...",
    enterTone: "z.B. Professionell, Locker, Formell...",
    enterVoice: "z.B. Erste Person, Dritte Person, Aktiv...",
    enterGuidelines: "Beschreiben Sie den Schreibstil, Präferenzen und Regeln...",
  },
};

export default function StyleProfiles() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<StyleProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    tone: "",
    voice: "",
    guidelines: "",
  });

  const { data: profiles, isLoading } = useQuery<StyleProfile[]>({
    queryKey: ["/api/style-profiles"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/style-profiles", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/style-profiles"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Profile created",
        description: "Your style profile has been saved.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PUT", `/api/style-profiles/${editingProfile?.id}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/style-profiles"] });
      setIsDialogOpen(false);
      setEditingProfile(null);
      resetForm();
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/style-profiles/${id}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/style-profiles"] });
      toast({
        title: "Profile deleted",
        description: "The style profile has been removed.",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      tone: "",
      voice: "",
      guidelines: "",
    });
  };

  const handleEdit = (profile: StyleProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      tone: profile.tone,
      voice: profile.voice,
      guidelines: profile.guidelines || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingProfile) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">{t.styleProfiles}</h1>
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProfile ? t.edit : t.createNew}</DialogTitle>
              <DialogDescription>
                Define tone, voice, and writing guidelines for consistent content
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
                  data-testid="input-profile-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tone">{t.tone}</Label>
                  <Input
                    id="tone"
                    placeholder={t.enterTone}
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                    data-testid="input-tone"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="voice">{t.voice}</Label>
                  <Input
                    id="voice"
                    placeholder={t.enterVoice}
                    value={formData.voice}
                    onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
                    data-testid="input-voice"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="guidelines">{t.guidelines}</Label>
                <Textarea
                  id="guidelines"
                  placeholder={t.enterGuidelines}
                  value={formData.guidelines}
                  onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                  className="min-h-32"
                  data-testid="input-guidelines"
                />
              </div>
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
                disabled={!formData.name || !formData.tone || !formData.voice || createMutation.isPending || updateMutation.isPending}
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
            <Card key={profile.id} className="hover-elevate" data-testid={`card-profile-${profile.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{profile.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {profile.tone} • {profile.voice}
                    </CardDescription>
                  </div>
                  <Wand2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.guidelines && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{profile.guidelines}</p>
                )}
                <div className="flex items-center justify-end gap-1">
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
                    onClick={() => deleteMutation.mutate(profile.id)}
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
    </div>
  );
}
