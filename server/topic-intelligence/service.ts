/**
 * Topic Intelligence Service
 * Main orchestrator for document processing, topic classification, and synthesis
 */

import { chunkDocument } from "./chunking.js";
import { generateEmbedding, generateEmbeddingsBatch } from "./embeddings.js";
import { classifyTopics, extractEntities } from "./classification.js";
import type { IStorage } from "../storage.js";
import type { InsertDocumentChunk, InsertTopic, InsertDocumentTopic, InsertEntity } from "@shared/schema";

const topicIntelligenceConfig = {
  embeddingsEnabled: process.env.TOPIC_INTELLIGENCE_EMBEDDINGS !== "off",
  batchSize: parseInt(process.env.TOPIC_INTELLIGENCE_BATCH || "50", 10),
};

const topicIntelligenceSearchConfig = {
  embeddingsEnabled: process.env.TOPIC_INTELLIGENCE_EMBEDDINGS !== "off",
  hybridMode: process.env.TOPIC_INTELLIGENCE_HYBRID === "on",
  chunkLimitForSearch: parseInt(process.env.TOPIC_INTELLIGENCE_CHUNK_LIMIT || "300", 10),
};

export class TopicIntelligenceService {
  constructor(private storage: IStorage) {}

  /**
   * Process an uploaded file: chunk, embed, classify, extract entities
   */
  async processUploadedFile(fileId: string): Promise<{
    chunks: number;
    topics: string[];
    entities: number;
  }> {
    try {
      // Get the file
      const file = await this.storage.getUploadedFile(fileId);
      if (!file || !file.extractedContent) {
        throw new Error("File not found or has no extracted content");
      }

      // Memory safety: Limit content size to prevent OOM
      // CRITICAL: Further reduced for Topic Intelligence processing
      const MAX_CONTENT_SIZE = 100000; // 100KB of text (reduced from 500KB)
      if (file.extractedContent.length > MAX_CONTENT_SIZE) {
        console.warn(`File content too large: ${file.extractedContent.length} chars. Truncating to ${MAX_CONTENT_SIZE} chars`);
        file.extractedContent = file.extractedContent.substring(0, MAX_CONTENT_SIZE);
      }

      // Step 1: Chunk the document
      const chunks = chunkDocument(file.extractedContent, {
        maxChunkSize: 800, // Reduced from 1000
        overlap: 50, // Reduced from 100
        preserveHeadings: true,
        preserveSections: true,
      });

      // Memory safety: Limit number of chunks to prevent OOM
      const MAX_CHUNKS = 100; // Reduced from 200
      if (chunks.length > MAX_CHUNKS) {
        console.warn(`Too many chunks (${chunks.length}), limiting to ${MAX_CHUNKS}`);
        chunks.splice(MAX_CHUNKS);
      }

      console.log(`Created ${chunks.length} chunks for file ${file.filename}`);

      const chunkTexts = chunks.map((chunk) =>
        chunk.heading ? `${chunk.heading}\n${chunk.content}` : chunk.content
      );

      const chunkEmbeddings: Array<number[] | undefined> = [];
      let embeddingsEnabled = topicIntelligenceConfig.embeddingsEnabled;

      if (embeddingsEnabled) {
        try {
          for (let i = 0; i < chunkTexts.length; i += topicIntelligenceConfig.batchSize) {
            const batch = chunkTexts.slice(i, i + topicIntelligenceConfig.batchSize);
            const results = await generateEmbeddingsBatch(batch);
            chunkEmbeddings.push(...results.map((r) => r.embedding));
          }
          console.log(
            `[topic-intel] generated embeddings for ${chunkTexts.length} chunks for file ${file.id}`
          );
        } catch (error: any) {
          console.warn(
            "[topic-intel] embedding generation failed; falling back to keyword-only chunks:",
            error
          );
          embeddingsEnabled = false;
        }
      }

      // Step 2: Store chunks (with embeddings when available)
      const storedChunks: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        const chunkData: InsertDocumentChunk = {
          uploadedFileId: fileId,
          chunkIndex: chunk.index,
          content: chunk.content,
          heading: chunk.heading,
          embedding:
          embeddingsEnabled && chunkEmbeddings[i]
              ? chunkEmbeddings[i]
              : [],
          metadata: chunk.metadata,
        };

        const stored = await this.storage.createDocumentChunk(chunkData);
        storedChunks.push(stored.id);
      }

      console.log(`Stored ${storedChunks.length} chunks (simplified mode - no AI)`);

      // Step 3: Simple keyword-based topic classification
      const existingTopics = await this.storage.getAllTopics();
      const classifications = this.classifyByKeywords(file.extractedContent, existingTopics);

      console.log(`Classified into ${classifications.length} topics using keywords`);

      // Step 4: Link to topics
      const topicIds: string[] = [];
      for (const topicId of classifications) {
        topicIds.push(topicId);

        // Link file to topic
        const linkData: InsertDocumentTopic = {
          uploadedFileId: fileId,
          topicId,
          confidence: 0.8, // Fixed confidence for keyword matching
        };
        await this.storage.createDocumentTopic(linkData);
      }

      // Step 5: Simple entity extraction (regex-based, no AI)
      let entityCount = 0;

      if (storedChunks.length > 0) {
        const simpleEntities = this.extractSimpleEntities(file.extractedContent);
        
        // Memory safety: Limit entities to prevent OOM
        const MAX_ENTITIES = 100;
        const limitedEntities = simpleEntities.slice(0, MAX_ENTITIES);
        
        if (simpleEntities.length > MAX_ENTITIES) {
          console.warn(`Too many entities (${simpleEntities.length}), limiting to ${MAX_ENTITIES}`);
        }
        
        // Link entities to first chunk (simplified approach)
        const firstChunkId = storedChunks[0];
        
        for (const entity of limitedEntities) {
          const entityData: InsertEntity = {
            chunkId: firstChunkId,
            entityType: entity.type,
            value: entity.value,
            context: entity.context,
            metadata: entity.metadata,
          };
          await this.storage.createEntity(entityData);
          entityCount++;
        }
      }

      return {
        chunks: chunks.length,
        topics: topicIds,
        entities: entityCount,
      };
    } catch (error: any) {
      console.error("Failed to process file:", error);
      throw error;
    }
  }

  /**
   * Simple keyword search (no AI embeddings)
   */
  async semanticSearch(
    query: string,
    options: {
      topK?: number;
      threshold?: number;
      topicId?: string;
    } = {}
  ): Promise<Array<{
    chunkId: string;
    content: string;
    similarity: number;
    heading?: string;
    sourceFile?: string;
  }>> {
    const { topK = 10, topicId, threshold = 0 } = options;

    try {
      let chunks = await this.storage.getAllDocumentChunks();

      if (topicId) {
        const topicFiles = await this.storage.getDocumentTopicsByTopic(topicId);
        const fileIds = topicFiles.map((t) => t.uploadedFileId).filter(Boolean) as string[];
        chunks = chunks.filter((c) => c.uploadedFileId && fileIds.includes(c.uploadedFileId));
      }

      chunks = chunks.slice(0, topicIntelligenceSearchConfig.chunkLimitForSearch);

      const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      const keywordInfo = chunks.map((chunk) => {
        const content = chunk.content.toLowerCase();
        const matches = queryWords.filter((word) => content.includes(word)).length;
        const keywordScore = queryWords.length ? matches / queryWords.length : 0;
        return { chunk, keywordScore, content };
      });

      const hasEmbeddings = chunks.some(
        (chunk) => Array.isArray(chunk.embedding) && chunk.embedding.length > 0
      );
      const useEmbeddings =
        topicIntelligenceSearchConfig.embeddingsEnabled && hasEmbeddings;

      if (useEmbeddings) {
        console.log("[topic-intel] semantic search using embeddings", {
          hybrid: topicIntelligenceSearchConfig.hybridMode,
        });

        const queryEmbedding = await generateEmbedding(query);
        const scored = keywordInfo
          .filter(
            (info) =>
              Array.isArray(info.chunk.embedding) && info.chunk.embedding.length > 0
          )
          .map((info) => {
            const cosine = cosineSimilarity(
              queryEmbedding.embedding,
              info.chunk.embedding as number[]
            );
            const finalScore = topicIntelligenceSearchConfig.hybridMode
              ? Math.max(0, 0.7 * cosine + 0.3 * info.keywordScore)
              : cosine;
            return { info, similarity: finalScore };
          })
          .filter((item) => item.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);

        const enhanced = await Promise.all(
          scored.map(async ({ info, similarity }) => {
            let sourceFile: string | undefined;
            if (info.chunk.uploadedFileId) {
              const file = await this.storage.getUploadedFile(info.chunk.uploadedFileId);
              sourceFile = file?.filename;
            }
            return {
              chunkId: info.chunk.id,
              content: info.chunk.content,
              similarity,
              heading: info.chunk.heading || undefined,
              sourceFile,
            };
          })
        );
        return enhanced;
      }

      console.log("[topic-intel] semantic search using keyword fallback");
      const keywordResults = keywordInfo
        .map(({ chunk, keywordScore }) => ({
          chunk,
          similarity: keywordScore,
        }))
        .filter((result) => result.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      const enhanced = await Promise.all(
        keywordResults.map(async (r) => {
          let sourceFile: string | undefined;
          if (r.chunk.uploadedFileId) {
            const file = await this.storage.getUploadedFile(r.chunk.uploadedFileId);
            sourceFile = file?.filename;
          }
          return {
            chunkId: r.chunk.id,
            content: r.chunk.content,
            similarity: r.similarity,
            heading: r.chunk.heading || undefined,
            sourceFile,
          };
        })
      );

      return enhanced;
    } catch (error: any) {
      console.error("Search failed:", error);
      throw error;
    }
  }

  /**
   * Classify document by keyword matching (no AI)
   */
  private classifyByKeywords(content: string, existingTopics: any[]): string[] {
    const contentLower = content.toLowerCase();
    const matchedTopicIds: string[] = [];

    for (const topic of existingTopics) {
      const keywords = topic.keywords || [];
      const matches = keywords.filter((kw: string) => 
        contentLower.includes(kw.toLowerCase())
      );
      
      if (matches.length > 0) {
        matchedTopicIds.push(topic.id);
      }
    }

    return matchedTopicIds;
  }

  /**
   * Extract simple entities using regex (no AI)
   */
  private extractSimpleEntities(content: string): Array<{
    type: string;
    value: string;
    context: string;
    metadata?: any;
  }> {
    const entities: Array<{
      type: string;
      value: string;
      context: string;
      metadata?: any;
    }> = [];

    // Early exit safety: Limit content size for regex processing
    // CRITICAL: Regex on large text causes OOM - use small limit
    const MAX_CONTENT_FOR_REGEX = 50000; // 50KB (reduced from 100KB)
    const contentToProcess = content.length > MAX_CONTENT_FOR_REGEX 
      ? content.substring(0, MAX_CONTENT_FOR_REGEX)
      : content;
    
    if (content.length > MAX_CONTENT_FOR_REGEX) {
      console.warn(`Content too large for regex (${content.length} chars), processing only first ${MAX_CONTENT_FOR_REGEX} chars`);
    }

    // Extract numbers with units (limit matches)
    const numberRegex = /(\d+(?:\.\d+)?)\s*(years?|months?|days?|°C|°F|%|kg|mg|ml)/gi;
    let match;
    let numberCount = 0;
    const MAX_PER_TYPE = 30; // Limit per entity type (reduced from 50)
    
    while ((match = numberRegex.exec(contentToProcess)) !== null && numberCount < MAX_PER_TYPE) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(contentToProcess.length, match.index + match[0].length + 50);
      entities.push({
        type: "number",
        value: match[1],
        context: contentToProcess.substring(start, end),
        metadata: { unit: match[2] },
      });
      numberCount++;
    }

    // Extract dates (limit matches)
    const dateRegex = /\b(\d{4}[-/]\d{2}[-/]\d{2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})\b/g;
    let dateCount = 0;
    
    while ((match = dateRegex.exec(contentToProcess)) !== null && dateCount < MAX_PER_TYPE) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(contentToProcess.length, match.index + match[0].length + 50);
      entities.push({
        type: "date",
        value: match[1],
        context: contentToProcess.substring(start, end),
      });
      dateCount++;
    }

    // Extract regulations (limit matches)
    const regRegex = /\b(ISO\s+\d+(?::\d+)?|Article\s+\d+(?:\.\d+)?|Section\s+\d+)\b/gi;
    let regCount = 0;
    
    while ((match = regRegex.exec(contentToProcess)) !== null && regCount < MAX_PER_TYPE) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(contentToProcess.length, match.index + match[0].length + 50);
      entities.push({
        type: "regulation",
        value: match[1],
        context: contentToProcess.substring(start, end),
      });
      regCount++;
    }

    return entities;
  }

  /**
   * Build or update topic pack for a specific topic
   */
  async buildTopicPack(topicId: string): Promise<void> {
    try {
      const topic = await this.storage.getTopic(topicId);
      if (!topic) {
        throw new Error("Topic not found");
      }

      // Get all files for this topic
      const topicLinks = await this.storage.getDocumentTopicsByTopic(topicId);
      const fileIds = topicLinks.map(t => t.uploadedFileId).filter(Boolean) as string[];

      if (fileIds.length === 0) {
        console.log(`No files found for topic ${topic.name}`);
        return;
      }

      // Get all chunks for these files
      const allChunks = await this.storage.getAllDocumentChunks();
      const topicChunks = allChunks.filter(c => 
        c.uploadedFileId && fileIds.includes(c.uploadedFileId)
      );

      console.log(`Found ${topicChunks.length} chunks for topic ${topic.name}`);

      // Get entities from these chunks
      const chunkIds = topicChunks.map(c => c.id);
      const entities = await this.storage.getEntitiesByChunks(chunkIds);

      // Build terminology map
      const terminologyMap: Record<string, string> = {};
      entities
        .filter(e => e.entityType === "term")
        .forEach(e => {
          const metadata = e.metadata as any;
          if (metadata?.definition) {
            terminologyMap[e.value] = metadata.definition;
          }
        });

      // Build priority rules from regulations
      const priorityRules = entities
        .filter(e => e.entityType === "regulation")
        .map((e, i) => ({
          rule: `${e.value}: ${e.context}`,
          priority: 100 - i * 10,
        }))
        .slice(0, 10); // Top 10 rules

      // Extract sample sections (group by heading)
      const sectionMap = new Map<string, { content: string[]; chunkIds: string[] }>();
      topicChunks.forEach(chunk => {
        const heading = chunk.heading || "General";
        if (!sectionMap.has(heading)) {
          sectionMap.set(heading, { content: [], chunkIds: [] });
        }
        const section = sectionMap.get(heading)!;
        section.content.push(chunk.content);
        section.chunkIds.push(chunk.id);
      });

      const sampleSections = Array.from(sectionMap.entries())
        .map(([heading, data]) => ({
          heading,
          content: data.content.slice(0, 3).join('\n\n'),
          sourceChunkIds: data.chunkIds.slice(0, 3),
        }))
        .slice(0, 10); // Top 10 sections

      // Create or update topic pack
      const existingPacks = await this.storage.getTopicPacksByTopic(topicId);
      
      if (existingPacks.length > 0) {
        // Update existing
        await this.storage.updateTopicPack(existingPacks[0].id, {
          terminologyMap,
          priorityRules,
          sampleSections,
        });
      } else {
        // Create new
        await this.storage.createTopicPack({
          topicId,
          name: `${topic.name} Knowledge Pack`,
          terminologyMap,
          priorityRules,
          sampleSections,
        });
      }

      console.log(`Topic pack built for ${topic.name}`);
    } catch (error: any) {
      console.error("Failed to build topic pack:", error);
      throw error;
    }
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  const dot = a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
  const magA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const magB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  if (!magA || !magB) return 0;
  return dot / (magA * magB);
}
