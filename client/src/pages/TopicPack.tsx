import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Tag, Database, Calendar, Hash, Link as LinkIcon } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { Link } from "wouter";

const translations = {
  en: {
    backToTopics: "Back to Topics",
    topicPack: "Topic Pack",
    documents: "Documents",
    chunks: "Knowledge Chunks",
    entities: "Extracted Entities",
    keywords: "Keywords",
    description: "Description",
    noDocuments: "No documents in this topic yet",
    noChunks: "No chunks extracted yet",
    noEntities: "No entities found",
    fileText: "File",
    loading: "Loading...",
    numbers: "Numbers",
    dates: "Dates",
    regulations: "Regulations",
    terms: "Technical Terms",
    value: "Value",
    context: "Context",
    sourceFile: "Source",
  },
  ar: {
    backToTopics: "العودة للمواضيع",
    topicPack: "حزمة الموضوع",
    documents: "المستندات",
    chunks: "مقاطع المعرفة",
    entities: "الكيانات المستخرجة",
    keywords: "الكلمات المفتاحية",
    description: "الوصف",
    noDocuments: "لا توجد مستندات في هذا الموضوع بعد",
    noChunks: "لم يتم استخراج مقاطع بعد",
    noEntities: "لم يتم العثور على كيانات",
    fileText: "الملف",
    loading: "جاري التحميل...",
    numbers: "الأرقام",
    dates: "التواريخ",
    regulations: "اللوائح",
    terms: "المصطلحات الفنية",
    value: "القيمة",
    context: "السياق",
    sourceFile: "المصدر",
  },
  de: {
    backToTopics: "Zurück zu Themen",
    topicPack: "Themenpaket",
    documents: "Dokumente",
    chunks: "Wissensabschnitte",
    entities: "Extrahierte Entitäten",
    keywords: "Schlüsselwörter",
    description: "Beschreibung",
    noDocuments: "Noch keine Dokumente zu diesem Thema",
    noChunks: "Noch keine Abschnitte extrahiert",
    noEntities: "Keine Entitäten gefunden",
    fileText: "Datei",
    loading: "Laden...",
    numbers: "Zahlen",
    dates: "Daten",
    regulations: "Vorschriften",
    terms: "Fachbegriffe",
    value: "Wert",
    context: "Kontext",
    sourceFile: "Quelle",
  },
};

interface Topic {
  id: string;
  name: string;
  description: string | null;
  keywords: string[] | null;
}

interface DocumentTopic {
  id: string;
  uploadedFileId: string;
  topicId: string;
  confidence: number;
  file?: {
    id: string;
    filename: string;
    uploadedAt: string;
  };
}

interface Chunk {
  id: string;
  uploadedFileId: string;
  chunkIndex: number;
  content: string;
  heading: string | null;
  file?: {
    filename: string;
  };
}

interface Entity {
  id: string;
  chunkId: string;
  entityType: string;
  value: string;
  context: string;
  metadata: any;
}

export default function TopicPack() {
  const [, params] = useRoute("/topics/:id");
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const t = (key: keyof typeof translations.en) => translations[language][key] || key;
  const topicId = params?.id;

  // Fetch topic details
  const { data: topic, isLoading: topicLoading } = useQuery<Topic>({
    queryKey: [`/api/topics/${topicId}`],
    enabled: !!topicId,
  });

  // Fetch documents linked to this topic
  const { data: documentTopics = [], isLoading: docsLoading } = useQuery<DocumentTopic[]>({
    queryKey: [`/api/topics/${topicId}/documents`],
    enabled: !!topicId,
  });

  // Fetch chunks only when documents are loaded (prevent OOM)
  const { data: chunks = [], isLoading: chunksLoading } = useQuery<Chunk[]>({
    queryKey: [`/api/topics/${topicId}/chunks`],
    enabled: !!topicId && documentTopics.length > 0 && !docsLoading,
    queryFn: async () => {
      const fileIds = documentTopics.map(dt => dt.uploadedFileId);
      if (fileIds.length === 0) return [];
      
      // Limit to first 50 chunks to prevent OOM
      const response = await fetch(`/api/chunks/topic/${topicId}?limit=50`);
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
  });

  // Fetch entities only after chunks are loaded (prevent cascading OOM)
  const { data: entities = [], isLoading: entitiesLoading } = useQuery<Entity[]>({
    queryKey: [`/api/topics/${topicId}/entities`],
    enabled: !!topicId && chunks.length > 0 && !chunksLoading,
    queryFn: async () => {
      const chunkIds = chunks.map(c => c.id);
      if (chunkIds.length === 0) return [];
      
      // Limit to first 100 entities to prevent OOM
      const response = await fetch(`/api/entities/topic/${topicId}?limit=100`);
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
  });

  const isLoading = topicLoading || docsLoading || chunksLoading || entitiesLoading;

  // Group entities by type
  const entitiesByType = entities.reduce((acc, entity) => {
    if (!acc[entity.entityType]) {
      acc[entity.entityType] = [];
    }
    acc[entity.entityType].push(entity);
    return acc;
  }, {} as Record<string, Entity[]>);

  if (!topicId) {
    return <div className="p-6">{t("loading")}</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/topics")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          {isLoading ? (
            <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Tag className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold" data-testid="text-topic-name">
                  {topic?.name}
                </h1>
              </div>
              {topic?.description && (
                <p className="text-muted-foreground mt-2" data-testid="text-topic-description">
                  {topic.description}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Keywords */}
      {topic?.keywords && topic.keywords.length > 0 && (
        <Card data-testid="card-keywords">
          <CardHeader>
            <CardTitle className="text-sm">{t("keywords")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topic.keywords.map((keyword, idx) => (
                <Badge key={idx} variant="secondary" data-testid={`badge-keyword-${idx}`}>
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-3" data-testid="tabs-list">
          <TabsTrigger value="documents" data-testid="tab-documents">
            <FileText className="h-4 w-4 mr-2" />
            {t("documents")} ({documentTopics.length})
          </TabsTrigger>
          <TabsTrigger value="chunks" data-testid="tab-chunks">
            <Database className="h-4 w-4 mr-2" />
            {t("chunks")} ({chunks.length})
          </TabsTrigger>
          <TabsTrigger value="entities" data-testid="tab-entities">
            <Hash className="h-4 w-4 mr-2" />
            {t("entities")} ({entities.length})
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          {documentTopics.length === 0 ? (
            <Card data-testid="empty-documents">
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("noDocuments")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {documentTopics.map((dt) => (
                <Card key={dt.id} className="hover-elevate" data-testid={`card-document-${dt.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {dt.file?.filename || dt.uploadedFileId}
                    </CardTitle>
                    {dt.file?.uploadedAt && (
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(dt.file.uploadedAt).toLocaleDateString()}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" data-testid={`badge-confidence-${dt.id}`}>
                        Confidence: {Math.round(dt.confidence * 100)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Chunks Tab */}
        <TabsContent value="chunks" className="space-y-4">
          {chunks.length === 0 ? (
            <Card data-testid="empty-chunks">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("noChunks")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {chunks.map((chunk) => (
                <Card key={chunk.id} data-testid={`card-chunk-${chunk.id}`}>
                  <CardHeader>
                    {chunk.heading && (
                      <CardTitle className="text-base">{chunk.heading}</CardTitle>
                    )}
                    <CardDescription className="flex items-center gap-2">
                      <LinkIcon className="h-3 w-3" />
                      {chunk.file?.filename || t("sourceFile")}
                      <Badge variant="outline" className="ml-auto">
                        #{chunk.chunkIndex + 1}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {chunk.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Entities Tab */}
        <TabsContent value="entities" className="space-y-4">
          {entities.length === 0 ? (
            <Card data-testid="empty-entities">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("noEntities")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(entitiesByType).map(([type, typeEntities]) => (
                <Card key={type} data-testid={`card-entities-${type}`}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">{type}s</CardTitle>
                    <CardDescription>{typeEntities.length} found</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {typeEntities.map((entity, idx) => (
                        <div
                          key={entity.id}
                          className="border-l-2 border-primary/20 pl-4 py-2"
                          data-testid={`entity-${type}-${idx}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">{entity.value}</Badge>
                            {entity.metadata?.unit && (
                              <span className="text-xs text-muted-foreground">
                                {entity.metadata.unit}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{entity.context}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
