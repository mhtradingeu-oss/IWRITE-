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

      // Step 1: Chunk the document
      const chunks = chunkDocument(file.extractedContent, {
        maxChunkSize: 1000,
        overlap: 100,
        preserveHeadings: true,
        preserveSections: true,
      });

      console.log(`Created ${chunks.length} chunks for file ${file.filename}`);

      // Step 2: Generate embeddings for all chunks
      const embeddings = await generateEmbeddingsBatch(
        chunks.map(c => c.content)
      );

      // Step 3: Store chunks with embeddings
      const storedChunks: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = embeddings[i];

        const chunkData: InsertDocumentChunk = {
          uploadedFileId: fileId,
          chunkIndex: chunk.index,
          content: chunk.content,
          heading: chunk.heading,
          embedding: embedding.embedding,
          metadata: chunk.metadata,
        };

        const stored = await this.storage.createDocumentChunk(chunkData);
        storedChunks.push(stored.id);
      }

      // Step 4: Classify topics
      const existingTopics = await this.storage.getAllTopics();
      const classifications = await classifyTopics(
        file.extractedContent,
        existingTopics.map(t => ({
          name: t.name,
          description: t.description || "",
          keywords: t.keywords || [],
        }))
      );

      console.log(`Classified into ${classifications.length} topics`);

      // Step 5: Store or link topics
      const topicIds: string[] = [];
      for (const classification of classifications) {
        // Check if topic exists
        let topic = existingTopics.find(t => 
          t.name.toLowerCase() === classification.topicName.toLowerCase()
        );

        if (!topic) {
          // Create new topic
          const topicData: InsertTopic = {
            name: classification.topicName,
            description: classification.description,
            keywords: classification.keywords,
          };
          topic = await this.storage.createTopic(topicData);
        }

        topicIds.push(topic.id);

        // Link file to topic
        const linkData: InsertDocumentTopic = {
          uploadedFileId: fileId,
          topicId: topic.id,
          confidence: classification.confidence,
        };
        await this.storage.createDocumentTopic(linkData);
      }

      // Step 6: Extract entities from content and link to appropriate chunks
      const entities = await extractEntities(file.extractedContent);
      let entityCount = 0;

      if (storedChunks.length > 0) {
        // Helper function to find the best matching chunk for an entity
        const findChunkForEntity = (context: string): string => {
          // Find chunk that contains the entity context
          for (let i = 0; i < chunks.length; i++) {
            if (chunks[i].content.includes(context.substring(0, 50))) {
              return storedChunks[i];
            }
          }
          // Fallback to first chunk if no match found
          return storedChunks[0];
        };

        // Store numbers with proper chunk linkage
        for (const num of entities.numbers) {
          const chunkId = findChunkForEntity(num.context);
          const entityData: InsertEntity = {
            chunkId,
            entityType: "number",
            value: num.value,
            context: num.context,
            metadata: { unit: num.unit },
          };
          await this.storage.createEntity(entityData);
          entityCount++;
        }

        // Store regulations with proper chunk linkage
        for (const reg of entities.regulations) {
          const chunkId = findChunkForEntity(reg.context);
          const entityData: InsertEntity = {
            chunkId,
            entityType: "regulation",
            value: reg.value,
            context: reg.context,
          };
          await this.storage.createEntity(entityData);
          entityCount++;
        }

        // Store terms with proper chunk linkage
        for (const term of entities.terms) {
          const chunkId = findChunkForEntity(term.context);
          const entityData: InsertEntity = {
            chunkId,
            entityType: "term",
            value: term.value,
            context: term.context,
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
   * Semantic search across all document chunks
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
    const { topK = 10, threshold = 0.7, topicId } = options;

    try {
      // Generate query embedding
      const queryEmbedding = await generateEmbedding(query);

      // Get all chunks (or filter by topic)
      let chunks = await this.storage.getAllDocumentChunks();

      // Filter by topic if specified
      if (topicId) {
        const topicFiles = await this.storage.getDocumentTopicsByTopic(topicId);
        const fileIds = topicFiles.map(t => t.uploadedFileId).filter(Boolean) as string[];
        chunks = chunks.filter(c => c.uploadedFileId && fileIds.includes(c.uploadedFileId));
      }

      // Filter chunks that have embeddings
      const chunksWithEmbeddings = chunks.filter(c => c.embedding && Array.isArray(c.embedding));

      // Find similar chunks
      const similar = findSimilarChunks(
        queryEmbedding.embedding,
        chunksWithEmbeddings.map(c => ({
          id: c.id,
          content: c.content,
          embedding: c.embedding as number[],
          heading: c.heading || undefined,
          metadata: c.metadata,
        })),
        topK,
        threshold
      );

      // Enhance with source file info
      const enhanced = await Promise.all(
        similar.map(async (s) => {
          const chunk = chunks.find(c => c.id === s.chunkId);
          let sourceFile: string | undefined;
          
          if (chunk?.uploadedFileId) {
            const file = await this.storage.getUploadedFile(chunk.uploadedFileId);
            sourceFile = file?.filename;
          }

          return {
            ...s,
            sourceFile,
          };
        })
      );

      return enhanced;
    } catch (error: any) {
      console.error("Semantic search failed:", error);
      throw error;
    }
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
