import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Tag, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const translations = {
  en: {
    search: "Search",
    searchPlaceholder: "Search across all your documents...",
    searchButton: "Search",
    topicFilter: "Filter by Topic",
    allTopics: "All Topics",
    results: "Results",
    noResults: "No results found",
    noResultsDescription: "Try different keywords or remove filters",
    searching: "Searching...",
    similarity: "Match",
    sourceFile: "Source",
    chunk: "Chunk",
  },
  ar: {
    search: "البحث",
    searchPlaceholder: "ابحث عبر جميع مستنداتك...",
    searchButton: "بحث",
    topicFilter: "تصفية حسب الموضوع",
    allTopics: "جميع المواضيع",
    results: "النتائج",
    noResults: "لم يتم العثور على نتائج",
    noResultsDescription: "جرب كلمات مفتاحية مختلفة أو أزل التصفية",
    searching: "جاري البحث...",
    similarity: "التطابق",
    sourceFile: "المصدر",
    chunk: "المقطع",
  },
  de: {
    search: "Suche",
    searchPlaceholder: "Durchsuchen Sie alle Ihre Dokumente...",
    searchButton: "Suchen",
    topicFilter: "Nach Thema filtern",
    allTopics: "Alle Themen",
    results: "Ergebnisse",
    noResults: "Keine Ergebnisse gefunden",
    noResultsDescription: "Versuchen Sie andere Schlüsselwörter oder entfernen Sie Filter",
    searching: "Suchen...",
    similarity: "Übereinstimmung",
    sourceFile: "Quelle",
    chunk: "Abschnitt",
  },
};

interface Topic {
  id: string;
  name: string;
}

interface SearchResult {
  chunkId: string;
  content: string;
  similarity: number;
  heading?: string;
  sourceFile?: string;
}

export default function TopicSearch() {
  const { language } = useLanguage();
  const t = (key: keyof typeof translations.en) => translations[language][key] || key;
  
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined);
  const [searchTriggered, setSearchTriggered] = useState(false);

  // Fetch all topics for filter
  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
  });

  // Search query
  const { data: results = [], isLoading: searching } = useQuery<SearchResult[]>({
    queryKey: ["/api/topic-intelligence/search", query, selectedTopic],
    enabled: searchTriggered && query.trim().length > 0,
    queryFn: async () => {
      const response = await fetch("/api/topic-intelligence/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          topicId: selectedTopic || undefined,
          topK: 20,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
  });

  const handleSearch = () => {
    setSearchTriggered(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Safely highlight matching words without XSS risk
  const highlightMatches = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    // Escape HTML to prevent XSS
    const escapeHtml = (str: string) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };
    
    const escapedText = escapeHtml(text);
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let highlighted = escapedText;
    
    // Only highlight escaped content (safe from XSS)
    words.forEach(word => {
      const escapedWord = escapeHtml(word);
      const regex = new RegExp(`(${escapedWord})`, "gi");
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900">$1</mark>');
    });
    
    return highlighted;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Search className="h-8 w-8" />
          {t("search")}
        </h1>
        <p className="text-muted-foreground mt-1">
          Search across all your uploaded documents and extracted knowledge
        </p>
      </div>

      {/* Search Bar */}
      <Card data-testid="card-search">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                data-testid="input-search"
                className="text-base"
              />
            </div>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="w-48" data-testid="select-topic-filter">
                <SelectValue placeholder={t("allTopics")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-all-topics">{t("allTopics")}</SelectItem>
                {topics.map((topic) => (
                  <SelectItem 
                    key={topic.id} 
                    value={topic.id}
                    data-testid={`option-topic-${topic.id}`}
                  >
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleSearch}
              disabled={!query.trim() || searching}
              data-testid="button-search"
            >
              <Search className="h-4 w-4 mr-2" />
              {searching ? t("searching") : t("searchButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searchTriggered && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {t("results")} ({results.length})
            </h2>
            {results.length > 0 && (
              <Badge variant="outline" data-testid="badge-result-count">
                <Sparkles className="h-3 w-3 mr-1" />
                Keyword matching
              </Badge>
            )}
          </div>

          {searching ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse" data-testid={`skeleton-result-${i}`}>
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : results.length === 0 ? (
            <Card data-testid="empty-results">
              <CardContent className="py-12 text-center">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">{t("noResults")}</h3>
                <p className="text-muted-foreground">{t("noResultsDescription")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {results.map((result, idx) => (
                <Card 
                  key={result.chunkId} 
                  className="hover-elevate"
                  data-testid={`card-result-${idx}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {result.heading && (
                          <CardTitle className="text-base mb-1">
                            {result.heading}
                          </CardTitle>
                        )}
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          {result.sourceFile && (
                            <>
                              <FileText className="h-3 w-3" />
                              <span data-testid={`text-source-${idx}`}>
                                {result.sourceFile}
                              </span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={result.similarity >= 0.7 ? "default" : "secondary"}
                        data-testid={`badge-similarity-${idx}`}
                      >
                        {Math.round(result.similarity * 100)}% {t("similarity")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightMatches(result.content, query) 
                      }}
                      data-testid={`text-content-${idx}`}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
