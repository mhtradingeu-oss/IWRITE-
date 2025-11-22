import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Music, Send, RefreshCw, ThumbsUp, ThumbsDown, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { UpgradeModal } from "@/components/UpgradeModal";
import { isFree } from "@/lib/auth-helpers";

const translations = {
  en: {
    songwriter: "Songwriter",
    subtitle: "Create and refine song lyrics with AI assistance",
    proFeatureOnly: "PRO Feature Only",
    upgradeToPro: "Upgrade to PRO to unlock Songwriter",
    songwriterDescription: "The Songwriter tool is only available for PRO users. Upgrade now to create beautiful song lyrics in Arabic, German, and English.",
    songIdea: "Song Idea",
    songIdeaPlaceholder: "Write your song idea, story, emotions, key words...",
    language: "Language",
    dialect: "Dialect/Region",
    khaliji: "Arabic - Khaliji",
    egyptian: "Arabic - Egyptian",
    levant: "Arabic - Levantine",
    msa: "Arabic - MSA",
    german: "German",
    englishUS: "English (US)",
    englishUK: "English (UK)",
    other: "Other",
    songType: "Song Type",
    romantic: "Romantic",
    sad: "Sad / Heartbreak",
    motivational: "Motivational",
    social: "Social / Message",
    rap: "Rap / Trap",
    pop: "Pop / Dance",
    national: "National / Inspirational",
    songStructure: "Song Structure",
    structure1: "Intro + Verse 1 + Chorus + Verse 2 + Chorus",
    structure2: "Verse + Chorus + Bridge + Chorus",
    structure3: "Rap Verses + Hook",
    custom: "Custom",
    customStructureLabel: "Custom Structure",
    rhymePattern: "Rhyme Pattern",
    tight: "Tight Rhyme",
    loose: "Loose Rhyme",
    styleProfile: "Style Profile",
    chooseProfile: "Choose a style profile",
    referenceTexts: "Reference Texts",
    generateDraft: "Generate First Draft",
    improve: "Improve Selection",
    shorten: "Shorten",
    changeRhyme: "Change Rhyme",
    morePoetic: "Make More Poetic",
    lyricsEditor: "Lyrics Editor",
    feedback: "Feedback",
    keep: "Keep",
    notGood: "Not Good",
    loading: "Generating...",
    error: "Something went wrong",
    success: "Generated successfully",
  },
  ar: {
    songwriter: "كاتب الأغنية",
    subtitle: "إنشاء وتحسين كلمات الأغنية بمساعدة الذكاء الاصطناعي",
    proFeatureOnly: "ميزة PRO فقط",
    upgradeToPro: "ترقية إلى PRO لفتح Songwriter",
    songwriterDescription: "أداة Songwriter متاحة فقط لمستخدمي PRO. قم بالترقية الآن لإنشاء كلمات أغنية جميلة باللغة العربية والألمانية والإنجليزية.",
    songIdea: "فكرة الأغنية",
    songIdeaPlaceholder: "اكتب فكرة الأغنية، القصة، المشاعر، الكلمات الرئيسية...",
    language: "اللغة",
    dialect: "اللهجة/المنطقة",
    khaliji: "العربية - خليجي",
    egyptian: "العربية - مصري",
    levant: "العربية - شامي",
    msa: "العربية - الفصحى",
    german: "الألمانية",
    englishUS: "الإنجليزية (أمريكي)",
    englishUK: "الإنجليزية (بريطاني)",
    other: "أخرى",
    songType: "نوع الأغنية",
    romantic: "رومانسية",
    sad: "حزينة / قلب مكسور",
    motivational: "تحفيزية",
    social: "اجتماعية / رسالة",
    rap: "راب / ترابية",
    pop: "بوب / رقص",
    national: "وطنية / ملهمة",
    songStructure: "بنية الأغنية",
    structure1: "المقدمة + الآية 1 + الكورس + الآية 2 + الكورس",
    structure2: "الآية + الكورس + الجسر + الكورس",
    structure3: "آيات الراب + الهوك",
    custom: "مخصص",
    customStructureLabel: "البنية المخصصة",
    rhymePattern: "نمط القافية",
    tight: "قافية محكمة",
    loose: "قافية فضفاضة",
    styleProfile: "ملف التعريف النمطي",
    chooseProfile: "اختر ملف تعريف نمطي",
    referenceTexts: "النصوص المرجعية",
    generateDraft: "إنشاء المسودة الأولى",
    improve: "تحسين التحديد",
    shorten: "تقصير",
    changeRhyme: "تغيير القافية",
    morePoetic: "جعلها أكثر شاعرية",
    lyricsEditor: "محرر الكلمات",
    feedback: "التعليقات",
    keep: "احفظ",
    notGood: "ليس جيداً",
    loading: "جاري الإنشاء...",
    error: "حدث خطأ ما",
    success: "تم الإنشاء بنجاح",
  },
  de: {
    songwriter: "Songwriter",
    subtitle: "Erstellen und verfeinern Sie Songtexte mit KI-Unterstützung",
    proFeatureOnly: "Nur PRO-Funktion",
    upgradeToPro: "Upgrade zu PRO, um Songwriter freizuschalten",
    songwriterDescription: "Das Songwriter-Tool ist nur für PRO-Benutzer verfügbar. Führen Sie jetzt ein Upgrade durch, um wunderschöne Songtexte auf Arabisch, Deutsch und Englisch zu erstellen.",
    songIdea: "Songidee",
    songIdeaPlaceholder: "Schreiben Sie Ihre Songidee, Geschichte, Gefühle, Schlüsselwörter...",
    language: "Sprache",
    dialect: "Dialekt/Region",
    khaliji: "Arabisch - Khaliji",
    egyptian: "Arabisch - Ägyptisch",
    levant: "Arabisch - Levantinisch",
    msa: "Arabisch - MSA",
    german: "Deutsch",
    englishUS: "Englisch (USA)",
    englishUK: "Englisch (UK)",
    other: "Andere",
    songType: "Songtyp",
    romantic: "Romantisch",
    sad: "Traurig / Herzbruch",
    motivational: "Motivierend",
    social: "Sozial / Botschaft",
    rap: "Rap / Trap",
    pop: "Pop / Tanz",
    national: "National / Inspirierend",
    songStructure: "Songstruktur",
    structure1: "Intro + Vers 1 + Refrain + Vers 2 + Refrain",
    structure2: "Vers + Refrain + Brücke + Refrain",
    structure3: "Rap-Verse + Hook",
    custom: "Benutzerdefiniert",
    customStructureLabel: "Benutzerdefinierte Struktur",
    rhymePattern: "Reimschema",
    tight: "Festes Reimschema",
    loose: "Lockeres Reimschema",
    styleProfile: "Stilprofil",
    chooseProfile: "Wählen Sie ein Stilprofil",
    referenceTexts: "Referenztexte",
    generateDraft: "Ersten Entwurf generieren",
    improve: "Auswahl verbessern",
    shorten: "Verkürzen",
    changeRhyme: "Reim ändern",
    morePoetic: "Poetischer gestalten",
    lyricsEditor: "Lyrics-Editor",
    feedback: "Rückmeldung",
    keep: "Behalten",
    notGood: "Nicht gut",
    loading: "Wird generiert...",
    error: "Etwas ist schief gelaufen",
    success: "Erfolgreich generiert",
  },
};

interface GeneratedLyrics {
  intro?: string[];
  verse1?: string[];
  chorus?: string[];
  verse2?: string[];
  bridge?: string[];
  outro?: string[];
}

export default function Songwriter() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];
  const isRTL = language === "ar";
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Fetch user data for plan check
  const { data: user } = useQuery({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      const response = await fetch("/auth/me", { credentials: "include" });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user;
    },
  });

  const userIsFree = isFree(user?.plan);

  const [songIdea, setSongIdea] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [dialect, setDialect] = useState("khaliji");
  const [songType, setSongType] = useState("romantic");
  const [structure, setStructure] = useState("intro-verse1-chorus-verse2-chorus");
  const [customStructure, setCustomStructure] = useState("");
  const [rhymePattern, setRhymePattern] = useState("tight");
  const [styleProfileId, setStyleProfileId] = useState("");
  const [generatedLyrics, setGeneratedLyrics] = useState<GeneratedLyrics>({});
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());

  const { data: styleProfiles = [] } = useQuery({
    queryKey: ["/api/style-profiles"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!songIdea.trim()) {
        toast({ title: t.error, description: "Please enter a song idea" });
        throw new Error("Song idea required");
      }

      const response = await apiRequest("POST", "/api/songwriter/generate", {
        songIdea,
        language: selectedLanguage,
        dialect,
        songType,
        structure: structure === "custom" ? customStructure : structure,
        rhymePattern,
        styleProfileId: styleProfileId || undefined,
      });

      return response;
    },
    onSuccess: (data) => {
      setGeneratedLyrics(data);
      toast({ title: t.success });
    },
    onError: (error: any) => {
      toast({ title: t.error, description: error.message });
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ sectionType, content }: { sectionType: string; content: string }) => {
      return apiRequest("POST", "/api/songwriter/feedback", {
        sectionType,
        sectionContent: content,
        styleProfileId: styleProfileId || null,
        rating: selectedSections.has(sectionType) ? 1 : -1,
        userNote: null,
      });
    },
    onSuccess: () => {
      toast({ title: t.success });
    },
  });

  const handleSectionToggle = (sectionType: string, content: string) => {
    const newSelected = new Set(selectedSections);
    if (newSelected.has(sectionType)) {
      newSelected.delete(sectionType);
    } else {
      newSelected.add(sectionType);
    }
    setSelectedSections(newSelected);
    feedbackMutation.mutate({ sectionType, content });
  };

  const renderLyricsSection = (title: string, lines?: string[]) => {
    if (!lines || lines.length === 0) return null;

    return (
      <div key={title} className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
        <h3 className="font-bold text-lg mb-2 text-foreground">{title}</h3>
        <div className="bg-muted/50 p-4 rounded-md mb-2">
          {lines.map((line, idx) => (
            <div key={idx} className="text-sm leading-relaxed text-foreground">
              {line}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSectionToggle(title, lines.join("\n"))}
            className={selectedSections.has(title) ? "bg-green-500/20" : ""}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {t.keep}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSectionToggle(title, lines.join("\n"))}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            {t.notGood}
          </Button>
        </div>
      </div>
    );
  };

  // Show upgrade modal if user is FREE
  if (userIsFree) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 gap-6">
        <Card className="w-full max-w-md border-2 border-yellow-500/20">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <Crown className="h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl">{t.proFeatureOnly}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">{t.songwriterDescription}</p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => setUpgradeModalOpen(true)}
              data-testid="button-upgrade-songwriter"
            >
              <Crown className="h-4 w-4 mr-2" />
              {t.upgradeToPro}
            </Button>
          </CardContent>
        </Card>
        <UpgradeModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          onUpgrade={() => window.location.href = "/pricing"}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4 p-6 bg-background overflow-hidden">
      {/* Left Panel - Controls */}
      <div className="w-80 overflow-y-auto flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2" data-testid="text-page-title">
            {t.songwriter}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.songIdea}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t.songIdeaPlaceholder}
              value={songIdea}
              onChange={(e) => setSongIdea(e.target.value)}
              className="min-h-24"
              data-testid="textarea-song-idea"
            />

            <div>
              <Label className="text-sm">{t.language}</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">{t.dialect}</Label>
              <Select value={dialect} onValueChange={setDialect}>
                <SelectTrigger data-testid="select-dialect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="khaliji">{t.khaliji}</SelectItem>
                  <SelectItem value="egyptian">{t.egyptian}</SelectItem>
                  <SelectItem value="levant">{t.levant}</SelectItem>
                  <SelectItem value="msa">{t.msa}</SelectItem>
                  <SelectItem value="de">{t.german}</SelectItem>
                  <SelectItem value="en-us">{t.englishUS}</SelectItem>
                  <SelectItem value="en-uk">{t.englishUK}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">{t.songType}</Label>
              <Select value={songType} onValueChange={setSongType}>
                <SelectTrigger data-testid="select-song-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="romantic">{t.romantic}</SelectItem>
                  <SelectItem value="sad-heartbreak">{t.sad}</SelectItem>
                  <SelectItem value="motivational">{t.motivational}</SelectItem>
                  <SelectItem value="social-message">{t.social}</SelectItem>
                  <SelectItem value="rap-trap">{t.rap}</SelectItem>
                  <SelectItem value="pop-dance">{t.pop}</SelectItem>
                  <SelectItem value="national-inspirational">{t.national}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">{t.songStructure}</Label>
              <Select value={structure} onValueChange={setStructure}>
                <SelectTrigger data-testid="select-structure">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intro-verse1-chorus-verse2-chorus">{t.structure1}</SelectItem>
                  <SelectItem value="verse-chorus-bridge-chorus">{t.structure2}</SelectItem>
                  <SelectItem value="rap-verses-hook">{t.structure3}</SelectItem>
                  <SelectItem value="custom">{t.custom}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {structure === "custom" && (
              <div>
                <Label className="text-sm">{t.customStructureLabel}</Label>
                <input
                  type="text"
                  placeholder="e.g., intro,verse,chorus,outro"
                  value={customStructure}
                  onChange={(e) => setCustomStructure(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  data-testid="input-custom-structure"
                />
              </div>
            )}

            <div>
              <Label className="text-sm">{t.rhymePattern}</Label>
              <Select value={rhymePattern} onValueChange={setRhymePattern}>
                <SelectTrigger data-testid="select-rhyme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tight">{t.tight}</SelectItem>
                  <SelectItem value="loose">{t.loose}</SelectItem>
                  <SelectItem value="ABAB">ABAB</SelectItem>
                  <SelectItem value="AABB">AABB</SelectItem>
                  <SelectItem value="AAAA">AAAA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">{t.styleProfile}</Label>
              <Select value={styleProfileId} onValueChange={setStyleProfileId}>
                <SelectTrigger data-testid="select-style-profile">
                  <SelectValue placeholder={t.chooseProfile} />
                </SelectTrigger>
                <SelectContent>
                  {styleProfiles.map((profile: any) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="w-full"
              data-testid="button-generate"
            >
              {generateMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t.loading}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t.generateDraft}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Center Panel - Lyrics Editor */}
      <div className="flex-1 overflow-y-auto">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              {t.lyricsEditor}
            </CardTitle>
          </CardHeader>
          <CardContent className={isRTL ? "text-right" : "text-left"}>
            {Object.keys(generatedLyrics).length === 0 ? (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <p>{t.generateDraft}</p>
              </div>
            ) : (
              <div>
                {renderLyricsSection("Intro", generatedLyrics.intro)}
                {renderLyricsSection("Verse 1", generatedLyrics.verse1)}
                {renderLyricsSection("Chorus", generatedLyrics.chorus)}
                {renderLyricsSection("Verse 2", generatedLyrics.verse2)}
                {renderLyricsSection("Bridge", generatedLyrics.bridge)}
                {renderLyricsSection("Outro", generatedLyrics.outro)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - References & Feedback */}
      <div className="w-72 overflow-y-auto flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.referenceTexts}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste reference lyrics or poetry..."
              className="min-h-40"
              data-testid="textarea-references"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.feedback}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Select sections above to mark as good or bad. Feedback is saved for future improvements.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
