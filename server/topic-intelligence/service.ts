/**
 * Topic Intelligence Service
 * Main orchestrator for document processing, topic classification, and synthesis
 */

import { chunkDocument } from "./chunking.js";
import { generateEmbedding, generateEmbeddingsBatch, findSimilarChunks } from "./embeddings.js";
import { classifyTopics, extractEntities, extractSectionPatterns } from "./classification.js";
import type { IStorage } from "../storage.js";
import type { InsertDocumentChunk, InsertTopic, InsertDocumentTopic, InsertEntity } from "@shared/schema";

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
      const MAX_CONTENT_SIZE = 500000; // 500KB of text
      if (file.extractedContent.length > MAX_CONTENT_SIZE) {
        throw new Error(`File too large: ${file.extractedContent.length} chars. Maximum allowed: ${MAX_CONTENT_SIZE} chars`);
      }

      // Step 1: Chunk the document
      const chunks = chunkDocument(file.extractedContent, {
        maxChunkSize: 1000,
        overlap: 100,
        preserveHeadings: true,
        preserveSections: true,
      });

      // Memory safety: Limit number of chunks to prevent OOM during embedding generation
      const MAX_CHUNKS = 200;
      if (chunks.length > MAX_CHUNKS) {
        console.warn(`Too many chunks (${chunks.length}), limiting to ${MAX_CHUNKS}`);
        chunks.splice(MAX_CHUNKS);
      }

      console.log(`Created ${chunks.length} chunks for file ${file.filename}`);

      // Step 2: Store chunks WITHOUT embeddings (simplified mode)
      const storedChunks: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        const chunkData: InsertDocumentChunk = {
          uploadedFileId: fileId,
          chunkIndex: chunk.index,
          content: chunk.content,
          heading: chunk.heading,
          embedding: [], // Empty array - no AI embeddings
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
        
        // Link entities to first chunk (simplified approach)
        const firstChunkId = storedChunks[0];
        
        for (const entity of simpleEntities) {
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
    const { topK = 10, topicId } = options;

    try {
      // Get all chunks (or filter by topic)
      let chunks = await this.storage.getAllDocumentChunks();

      // Filter by topic if specified
      if (topicId) {
        const topicFiles = await this.storage.getDocumentTopicsByTopic(topicId);
        const fileIds = topicFiles.map(t => t.uploadedFileId).filter(Boolean) as string[];
        chunks = chunks.filter(c => c.uploadedFileId && fileIds.includes(c.uploadedFileId));
      }

      // Simple keyword matching
      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      
      const results = chunks
        .map(chunk => {
          const content = chunk.content.toLowerCase();
          const matches = queryWords.filter(word => content.includes(word)).length;
          const similarity = matches / queryWords.length;
          
          return {
            chunk,
            chunkId: chunk.id,
            content: chunk.content,
            similarity,
            heading: chunk.heading || undefined,
          };
        })
        .filter(r => r.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      // Enhance with source file info
      const enhanced = await Promise.all(
        results.map(async (r) => {
          let sourceFile: string | undefined;
          
          if (r.chunk?.uploadedFileId) {
            const file = await this.storage.getUploadedFile(r.chunk.uploadedFileId);
            sourceFile = file?.filename;
          }

          return {
            chunkId: r.chunkId,
            content: r.content,
            similarity: r.similarity,
            heading: r.heading,
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

    // Extract numbers with units
    const numberRegex = /(\d+(?:\.\d+)?)\s*(years?|months?|days?|°C|°F|%|kg|mg|ml)/gi;
    let match;
    while ((match = numberRegex.exec(content)) !== null) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(content.length, match.index + match[0].length + 50);
      entities.push({
        type: "number",
        value: match[1],
        context: content.substring(start, end),
        metadata: { unit: match[2] },
      });
    }

    // Extract dates
    const dateRegex = /\b(\d{4}[-/]\d{2}[-/]\d{2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})\b/g;
    while ((match = dateRegex.exec(content)) !== null) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(content.length, match.index + match[0].length + 50);
      entities.push({
        type: "date",
        value: match[1],
        context: content.substring(start, end),
      });
    }

    // Extract regulations (ISO, Article, etc.)
    const regRegex = /\b(ISO\s+\d+(?::\d+)?|Article\s+\d+(?:\.\d+)?|Section\s+\d+)\b/gi;
    while ((match = regRegex.exec(content)) !== null) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(content.length, match.index + match[0].length + 50);
      entities.push({
        type: "regulation",
        value: match[1],
        context: content.substring(start, end),
      });
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
