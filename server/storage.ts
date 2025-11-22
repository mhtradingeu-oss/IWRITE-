import {
  type Document,
  type InsertDocument,
  type Template,
  type InsertTemplate,
  type StyleProfile,
  type InsertStyleProfile,
  type UploadedFile,
  type InsertUploadedFile,
  type DocumentVersion,
  type InsertDocumentVersion,
  type QACheckResult,
  type InsertQACheckResult,
  type DocumentChunk,
  type InsertDocumentChunk,
  type Topic,
  type InsertTopic,
  type DocumentTopic,
  type InsertDocumentTopic,
  type TopicPack,
  type InsertTopicPack,
  type Entity,
  type InsertEntity,
  type SongwriterFeedback,
  type InsertSongwriterFeedback,
  documents,
  templates,
  styleProfiles,
  uploadedFiles,
  documentVersions,
  qaCheckResults,
  documentChunks,
  topics,
  documentTopics,
  topicPacks,
  entities,
  songwriterFeedback,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // Documents
  getDocument(id: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: string, doc: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;

  // Templates
  getTemplate(id: string): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;

  // Style Profiles
  getStyleProfile(id: string): Promise<StyleProfile | undefined>;
  getAllStyleProfiles(): Promise<StyleProfile[]>;
  createStyleProfile(profile: InsertStyleProfile): Promise<StyleProfile>;
  updateStyleProfile(id: string, profile: Partial<InsertStyleProfile>): Promise<StyleProfile | undefined>;
  deleteStyleProfile(id: string): Promise<boolean>;

  // Uploaded Files
  getUploadedFile(id: string): Promise<UploadedFile | undefined>;
  getAllUploadedFiles(): Promise<UploadedFile[]>;
  createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile>;
  deleteUploadedFile(id: string): Promise<boolean>;

  // Document Versions
  getDocumentVersions(documentId: string): Promise<DocumentVersion[]>;
  getAllVersions(): Promise<DocumentVersion[]>;
  createDocumentVersion(version: InsertDocumentVersion): Promise<DocumentVersion>;

  // QA Checks
  getQACheckResults(documentId: string): Promise<QACheckResult[]>;
  createQACheckResult(result: InsertQACheckResult): Promise<QACheckResult>;

  // Topic Intelligence: Document Chunks
  getDocumentChunk(id: string): Promise<DocumentChunk | undefined>;
  getAllDocumentChunks(): Promise<DocumentChunk[]>;
  getChunksByDocument(documentId: string): Promise<DocumentChunk[]>;
  getChunksByFile(fileId: string): Promise<DocumentChunk[]>;
  getChunksByTopic(topicId: string, limit?: number): Promise<DocumentChunk[]>;
  createDocumentChunk(chunk: InsertDocumentChunk): Promise<DocumentChunk>;
  deleteDocumentChunk(id: string): Promise<boolean>;

  // Topics
  getTopic(id: string): Promise<Topic | undefined>;
  getAllTopics(): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(id: string, topic: Partial<InsertTopic>): Promise<Topic | undefined>;
  deleteTopic(id: string): Promise<boolean>;

  // Document-Topic Relationships
  getDocumentTopicsByDocument(documentId: string): Promise<DocumentTopic[]>;
  getDocumentTopicsByFile(fileId: string): Promise<DocumentTopic[]>;
  getDocumentTopicsByTopic(topicId: string): Promise<DocumentTopic[]>;
  createDocumentTopic(link: InsertDocumentTopic): Promise<DocumentTopic>;
  deleteDocumentTopic(id: string): Promise<boolean>;

  // Topic Packs
  getTopicPack(id: string): Promise<TopicPack | undefined>;
  getAllTopicPacks(): Promise<TopicPack[]>;
  getTopicPacksByTopic(topicId: string): Promise<TopicPack[]>;
  createTopicPack(pack: InsertTopicPack): Promise<TopicPack>;
  updateTopicPack(id: string, pack: Partial<InsertTopicPack>): Promise<TopicPack | undefined>;
  deleteTopicPack(id: string): Promise<boolean>;

  // Entities
  getEntity(id: string): Promise<Entity | undefined>;
  getEntitiesByChunk(chunkId: string): Promise<Entity[]>;
  getEntitiesByChunks(chunkIds: string[]): Promise<Entity[]>;
  getEntitiesByTopic(topicId: string, limit?: number): Promise<Entity[]>;
  createEntity(entity: InsertEntity): Promise<Entity>;
  deleteEntity(id: string): Promise<boolean>;

  // Songwriter Feedback
  getSongwriterFeedback(styleProfileId: string, limit?: number): Promise<SongwriterFeedback[]>;
  createSongwriterFeedback(feedback: InsertSongwriterFeedback): Promise<SongwriterFeedback>;
}

export class MemStorage implements IStorage {
  private documents: Map<string, Document>;
  private templates: Map<string, Template>;
  private styleProfiles: Map<string, StyleProfile>;
  private uploadedFiles: Map<string, UploadedFile>;
  private documentVersions: Map<string, DocumentVersion>;
  private qaCheckResults: Map<string, QACheckResult>;
  private fileBuffers: Map<string, { buffer: Buffer; mimeType: string }>;
  private songwriterFeedbackList: SongwriterFeedback[];

  constructor() {
    this.documents = new Map();
    this.templates = new Map();
    this.styleProfiles = new Map();
    this.uploadedFiles = new Map();
    this.documentVersions = new Map();
    this.qaCheckResults = new Map();
    this.fileBuffers = new Map();
    this.songwriterFeedbackList = [];
  }

  // File buffer storage for in-memory file serving
  storeFileBuffer(id: string, buffer: Buffer, mimeType: string): void {
    this.fileBuffers.set(id, { buffer, mimeType });
  }

  getFileBuffer(id: string): { buffer: Buffer; mimeType: string } | undefined {
    return this.fileBuffers.get(id);
  }

  // Documents
  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date();
    const document: Document = {
      ...doc,
      id,
      language: doc.language || "en",
      createdAt: now,
      updatedAt: now,
      templateId: doc.templateId || null,
      styleProfileId: doc.styleProfileId || null,
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, doc: Partial<InsertDocument>): Promise<Document | undefined> {
    const existing = this.documents.get(id);
    if (!existing) return undefined;
    const updated: Document = {
      ...existing,
      ...doc,
      updatedAt: new Date(),
    };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Templates
  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const newTemplate: Template = {
      ...template,
      id,
      header: template.header || null,
      footer: template.footer || null,
      logoUrl: template.logoUrl || null,
      brandColors: template.brandColors || null,
      createdAt: new Date(),
    };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template | undefined> {
    const existing = this.templates.get(id);
    if (!existing) return undefined;
    const updated: Template = {
      ...existing,
      ...template,
    };
    this.templates.set(id, updated);
    return updated;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  // Style Profiles
  async getStyleProfile(id: string): Promise<StyleProfile | undefined> {
    return this.styleProfiles.get(id);
  }

  async getAllStyleProfiles(): Promise<StyleProfile[]> {
    return Array.from(this.styleProfiles.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createStyleProfile(profile: InsertStyleProfile): Promise<StyleProfile> {
    const id = randomUUID();
    const newProfile: StyleProfile = {
      ...profile,
      id,
      useCase: profile.useCase || "General",
      language: profile.language || "en",
      region: profile.region || null,
      formalityLevel: profile.formalityLevel || null,
      targetAudience: profile.targetAudience || null,
      purpose: profile.purpose || null,
      sentenceLengthPreference: profile.sentenceLengthPreference || null,
      structurePreference: profile.structurePreference || null,
      allowEmojis: profile.allowEmojis || 0,
      allowSlang: profile.allowSlang || 0,
      useMarketingLanguage: profile.useMarketingLanguage || 0,
      requireDisclaimers: profile.requireDisclaimers || 0,
      preferredPhrases: profile.preferredPhrases || null,
      forbiddenPhrases: profile.forbiddenPhrases || null,
      guidelines: profile.guidelines || null,
      createdAt: new Date(),
    };
    this.styleProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateStyleProfile(id: string, profile: Partial<InsertStyleProfile>): Promise<StyleProfile | undefined> {
    const existing = this.styleProfiles.get(id);
    if (!existing) return undefined;
    const updated: StyleProfile = {
      ...existing,
      ...profile,
    };
    this.styleProfiles.set(id, updated);
    return updated;
  }

  async deleteStyleProfile(id: string): Promise<boolean> {
    return this.styleProfiles.delete(id);
  }

  // Uploaded Files
  async getUploadedFile(id: string): Promise<UploadedFile | undefined> {
    return this.uploadedFiles.get(id);
  }

  async getAllUploadedFiles(): Promise<UploadedFile[]> {
    return Array.from(this.uploadedFiles.values()).sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile> {
    const id = randomUUID();
    const newFile: UploadedFile = {
      ...file,
      id,
      extractedContent: file.extractedContent || null,
      uploadedAt: new Date(),
    };
    this.uploadedFiles.set(id, newFile);
    return newFile;
  }

  async deleteUploadedFile(id: string): Promise<boolean> {
    return this.uploadedFiles.delete(id);
  }

  // Document Versions
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    return Array.from(this.documentVersions.values())
      .filter((v) => v.documentId === documentId)
      .sort((a, b) => b.version - a.version);
  }

  async getAllVersions(): Promise<DocumentVersion[]> {
    return Array.from(this.documentVersions.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createDocumentVersion(version: InsertDocumentVersion): Promise<DocumentVersion> {
    const id = randomUUID();
    const newVersion: DocumentVersion = {
      ...version,
      id,
      changeSummary: version.changeSummary || null,
      createdAt: new Date(),
    };
    this.documentVersions.set(id, newVersion);
    return newVersion;
  }

  // QA Checks
  async getQACheckResults(documentId: string): Promise<QACheckResult[]> {
    return Array.from(this.qaCheckResults.values())
      .filter((r) => r.documentId === documentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createQACheckResult(result: InsertQACheckResult): Promise<QACheckResult> {
    const id = randomUUID();
    const newResult: QACheckResult = {
      ...result,
      id,
      issues: result.issues ? [...result.issues] : null,
      createdAt: new Date(),
    };
    this.qaCheckResults.set(id, newResult);
    return newResult;
  }

  // Topic Intelligence stubs (not implemented in MemStorage)
  async getDocumentChunk(): Promise<DocumentChunk | undefined> { throw new Error("Topic Intelligence not supported in MemStorage"); }
  async getAllDocumentChunks(): Promise<DocumentChunk[]> { return []; }
  async getChunksByDocument(): Promise<DocumentChunk[]> { return []; }
  async getChunksByFile(): Promise<DocumentChunk[]> { return []; }
  async getChunksByTopic(): Promise<DocumentChunk[]> { return []; }
  async createDocumentChunk(): Promise<DocumentChunk> { throw new Error("Not implemented"); }
  async deleteDocumentChunk(): Promise<boolean> { return false; }
  async getTopic(): Promise<Topic | undefined> { return undefined; }
  async getAllTopics(): Promise<Topic[]> { return []; }
  async createTopic(): Promise<Topic> { throw new Error("Not implemented"); }
  async updateTopic(): Promise<Topic | undefined> { return undefined; }
  async deleteTopic(): Promise<boolean> { return false; }
  async getDocumentTopicsByDocument(): Promise<DocumentTopic[]> { return []; }
  async getDocumentTopicsByFile(): Promise<DocumentTopic[]> { return []; }
  async getDocumentTopicsByTopic(): Promise<DocumentTopic[]> { return []; }
  async createDocumentTopic(): Promise<DocumentTopic> { throw new Error("Not implemented"); }
  async deleteDocumentTopic(): Promise<boolean> { return false; }
  async getTopicPack(): Promise<TopicPack | undefined> { return undefined; }
  async getAllTopicPacks(): Promise<TopicPack[]> { return []; }
  async getTopicPacksByTopic(): Promise<TopicPack[]> { return []; }
  async createTopicPack(): Promise<TopicPack> { throw new Error("Not implemented"); }
  async updateTopicPack(): Promise<TopicPack | undefined> { return undefined; }
  async deleteTopicPack(): Promise<boolean> { return false; }
  async getEntity(): Promise<Entity | undefined> { return undefined; }
  async getEntitiesByChunk(): Promise<Entity[]> { return []; }
  async getEntitiesByChunks(): Promise<Entity[]> { return []; }
  async getEntitiesByTopic(): Promise<Entity[]> { return []; }
  async createEntity(): Promise<Entity> { throw new Error("Not implemented"); }
  async deleteEntity(): Promise<boolean> { return false; }
}

// Database Storage Implementation
export class DbStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required for DbStorage");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  // Documents
  async getDocument(id: string): Promise<Document | undefined> {
    const result = await this.db.select().from(documents).where(eq(documents.id, id));
    return result[0];
  }

  async getAllDocuments(): Promise<Document[]> {
    return await this.db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const result = await this.db.insert(documents).values(doc).returning();
    return result[0];
  }

  async updateDocument(id: string, doc: Partial<InsertDocument>): Promise<Document | undefined> {
    // Filter out undefined values to avoid unintended NULL writes
    const updates = Object.fromEntries(
      Object.entries(doc).filter(([_, value]) => value !== undefined)
    );
    const result = await this.db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return result[0];
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await this.db.delete(documents).where(eq(documents.id, id)).returning();
    return result.length > 0;
  }

  // Templates
  async getTemplate(id: string): Promise<Template | undefined> {
    const result = await this.db.select().from(templates).where(eq(templates.id, id));
    return result[0];
  }

  async getAllTemplates(): Promise<Template[]> {
    return await this.db.select().from(templates).orderBy(desc(templates.createdAt));
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const result = await this.db.insert(templates).values(template).returning();
    return result[0];
  }

  async updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template | undefined> {
    // Filter out undefined values to avoid unintended NULL writes
    const updates = Object.fromEntries(
      Object.entries(template).filter(([_, value]) => value !== undefined)
    );
    const result = await this.db
      .update(templates)
      .set(updates)
      .where(eq(templates.id, id))
      .returning();
    return result[0];
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await this.db.delete(templates).where(eq(templates.id, id)).returning();
    return result.length > 0;
  }

  // Style Profiles
  async getStyleProfile(id: string): Promise<StyleProfile | undefined> {
    const result = await this.db.select().from(styleProfiles).where(eq(styleProfiles.id, id));
    return result[0];
  }

  async getAllStyleProfiles(): Promise<StyleProfile[]> {
    return await this.db.select().from(styleProfiles).orderBy(desc(styleProfiles.createdAt));
  }

  async createStyleProfile(profile: InsertStyleProfile): Promise<StyleProfile> {
    const result = await this.db.insert(styleProfiles).values(profile).returning();
    return result[0];
  }

  async updateStyleProfile(id: string, profile: Partial<InsertStyleProfile>): Promise<StyleProfile | undefined> {
    // Filter out undefined values to avoid unintended NULL writes
    const updates = Object.fromEntries(
      Object.entries(profile).filter(([_, value]) => value !== undefined)
    );
    const result = await this.db
      .update(styleProfiles)
      .set(updates)
      .where(eq(styleProfiles.id, id))
      .returning();
    return result[0];
  }

  async deleteStyleProfile(id: string): Promise<boolean> {
    const result = await this.db.delete(styleProfiles).where(eq(styleProfiles.id, id)).returning();
    return result.length > 0;
  }

  // Uploaded Files
  async getUploadedFile(id: string): Promise<UploadedFile | undefined> {
    const result = await this.db.select().from(uploadedFiles).where(eq(uploadedFiles.id, id));
    return result[0];
  }

  async getAllUploadedFiles(): Promise<UploadedFile[]> {
    return await this.db.select().from(uploadedFiles).orderBy(desc(uploadedFiles.uploadedAt));
  }

  async createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile> {
    const result = await this.db.insert(uploadedFiles).values(file).returning();
    return result[0];
  }

  async deleteUploadedFile(id: string): Promise<boolean> {
    const result = await this.db.delete(uploadedFiles).where(eq(uploadedFiles.id, id)).returning();
    return result.length > 0;
  }

  // Document Versions
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    return await this.db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.documentId, documentId))
      .orderBy(desc(documentVersions.version));
  }

  async getAllVersions(): Promise<DocumentVersion[]> {
    return await this.db.select().from(documentVersions).orderBy(desc(documentVersions.createdAt));
  }

  async createDocumentVersion(version: InsertDocumentVersion): Promise<DocumentVersion> {
    const result = await this.db.insert(documentVersions).values(version).returning();
    return result[0];
  }

  // QA Checks
  async getQACheckResults(documentId: string): Promise<QACheckResult[]> {
    return await this.db
      .select()
      .from(qaCheckResults)
      .where(eq(qaCheckResults.documentId, documentId))
      .orderBy(desc(qaCheckResults.createdAt));
  }

  async createQACheckResult(result: InsertQACheckResult): Promise<QACheckResult> {
    const data: typeof qaCheckResults.$inferInsert = {
      ...result,
      issues: result.issues ? [...result.issues] : undefined,
    };
    const qr = await this.db.insert(qaCheckResults).values(data).returning();
    return qr[0];
  }

  // Topic Intelligence: Document Chunks
  async getDocumentChunk(id: string): Promise<DocumentChunk | undefined> {
    const result = await this.db.select().from(documentChunks).where(eq(documentChunks.id, id));
    return result[0];
  }

  async getAllDocumentChunks(): Promise<DocumentChunk[]> {
    return await this.db.select().from(documentChunks).orderBy(desc(documentChunks.createdAt));
  }

  async getChunksByDocument(documentId: string): Promise<DocumentChunk[]> {
    return await this.db
      .select()
      .from(documentChunks)
      .where(eq(documentChunks.documentId, documentId))
      .orderBy(documentChunks.chunkIndex);
  }

  async getChunksByFile(fileId: string): Promise<DocumentChunk[]> {
    return await this.db
      .select()
      .from(documentChunks)
      .where(eq(documentChunks.uploadedFileId, fileId))
      .orderBy(documentChunks.chunkIndex);
  }

  async getChunksByTopic(topicId: string, limit?: number): Promise<DocumentChunk[]> {
    // Get all document-topic links for this topic
    const documentTopicLinks = await this.db
      .select()
      .from(documentTopics)
      .where(eq(documentTopics.topicId, topicId));
    
    // Get unique file IDs
    const fileIdsSet = new Set(
      documentTopicLinks
        .map(dt => dt.uploadedFileId)
        .filter((id): id is string => id !== null && id !== undefined)
    );
    const fileIds = Array.from(fileIdsSet);
    
    if (fileIds.length === 0) {
      return [];
    }

    // Get chunks for these files with limit
    let query = this.db
      .select()
      .from(documentChunks)
      .where(inArray(documentChunks.uploadedFileId, fileIds))
      .orderBy(documentChunks.createdAt);
    
    // Apply limit if provided
    if (limit && limit > 0) {
      query = query.limit(limit) as any;
    }
    
    return await query;
  }

  async createDocumentChunk(chunk: InsertDocumentChunk): Promise<DocumentChunk> {
    const data: typeof documentChunks.$inferInsert = {
      ...chunk,
      embedding: chunk.embedding ? [...chunk.embedding] : undefined,
      metadata: chunk.metadata ? {
        startChar: chunk.metadata.startChar,
        endChar: chunk.metadata.endChar,
        pageNumber: chunk.metadata.pageNumber,
        section: chunk.metadata.section,
      } : undefined,
    };
    const result = await this.db.insert(documentChunks).values(data).returning();
    return result[0];
  }

  async deleteDocumentChunk(id: string): Promise<boolean> {
    const result = await this.db.delete(documentChunks).where(eq(documentChunks.id, id)).returning();
    return result.length > 0;
  }

  // Topics
  async getTopic(id: string): Promise<Topic | undefined> {
    const result = await this.db.select().from(topics).where(eq(topics.id, id));
    return result[0];
  }

  async getAllTopics(): Promise<Topic[]> {
    return await this.db.select().from(topics).orderBy(desc(topics.createdAt));
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const result = await this.db.insert(topics).values(topic).returning();
    return result[0];
  }

  async updateTopic(id: string, topic: Partial<InsertTopic>): Promise<Topic | undefined> {
    const updates = Object.fromEntries(
      Object.entries(topic).filter(([_, value]) => value !== undefined)
    );
    const result = await this.db
      .update(topics)
      .set(updates)
      .where(eq(topics.id, id))
      .returning();
    return result[0];
  }

  async deleteTopic(id: string): Promise<boolean> {
    const result = await this.db.delete(topics).where(eq(topics.id, id)).returning();
    return result.length > 0;
  }

  // Document-Topic Relationships
  async getDocumentTopicsByDocument(documentId: string): Promise<DocumentTopic[]> {
    return await this.db
      .select()
      .from(documentTopics)
      .where(eq(documentTopics.documentId, documentId));
  }

  async getDocumentTopicsByFile(fileId: string): Promise<DocumentTopic[]> {
    return await this.db
      .select()
      .from(documentTopics)
      .where(eq(documentTopics.uploadedFileId, fileId));
  }

  async getDocumentTopicsByTopic(topicId: string): Promise<DocumentTopic[]> {
    return await this.db
      .select()
      .from(documentTopics)
      .where(eq(documentTopics.topicId, topicId));
  }

  async createDocumentTopic(link: InsertDocumentTopic): Promise<DocumentTopic> {
    const result = await this.db.insert(documentTopics).values(link).returning();
    return result[0];
  }

  async deleteDocumentTopic(id: string): Promise<boolean> {
    const result = await this.db.delete(documentTopics).where(eq(documentTopics.id, id)).returning();
    return result.length > 0;
  }

  // Topic Packs
  async getTopicPack(id: string): Promise<TopicPack | undefined> {
    const result = await this.db.select().from(topicPacks).where(eq(topicPacks.id, id));
    return result[0];
  }

  async getAllTopicPacks(): Promise<TopicPack[]> {
    return await this.db.select().from(topicPacks).orderBy(desc(topicPacks.createdAt));
  }

  async getTopicPacksByTopic(topicId: string): Promise<TopicPack[]> {
    return await this.db
      .select()
      .from(topicPacks)
      .where(eq(topicPacks.topicId, topicId));
  }

  async createTopicPack(pack: InsertTopicPack): Promise<TopicPack> {
    const data: typeof topicPacks.$inferInsert = {
      ...pack,
      priorityRules: pack.priorityRules ? [...pack.priorityRules] : undefined,
      sampleSections: pack.sampleSections ? pack.sampleSections.map(s => ({
        heading: s.heading,
        content: s.content,
        sourceChunkIds: [...s.sourceChunkIds],
      })) : undefined,
    };
    const result = await this.db.insert(topicPacks).values(data).returning();
    return result[0];
  }

  async updateTopicPack(id: string, pack: Partial<InsertTopicPack>): Promise<TopicPack | undefined> {
    const updates = Object.fromEntries(
      Object.entries(pack).filter(([_, value]) => value !== undefined)
    );
    const result = await this.db
      .update(topicPacks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(topicPacks.id, id))
      .returning();
    return result[0];
  }

  async deleteTopicPack(id: string): Promise<boolean> {
    const result = await this.db.delete(topicPacks).where(eq(topicPacks.id, id)).returning();
    return result.length > 0;
  }

  // Entities
  async getEntity(id: string): Promise<Entity | undefined> {
    const result = await this.db.select().from(entities).where(eq(entities.id, id));
    return result[0];
  }

  async getEntitiesByChunk(chunkId: string): Promise<Entity[]> {
    return await this.db
      .select()
      .from(entities)
      .where(eq(entities.chunkId, chunkId));
  }

  async getEntitiesByChunks(chunkIds: string[]): Promise<Entity[]> {
    if (chunkIds.length === 0) return [];
    const results = await Promise.all(
      chunkIds.map(id => this.getEntitiesByChunk(id))
    );
    return results.flat();
  }

  async getEntitiesByTopic(topicId: string, limit?: number): Promise<Entity[]> {
    // CRITICAL: Only fetch chunk IDs (not full chunks with content) to prevent OOM
    const documentTopicLinks = await this.db
      .select()
      .from(documentTopics)
      .where(eq(documentTopics.topicId, topicId));
    
    const fileIdsSet = new Set(
      documentTopicLinks
        .map(dt => dt.uploadedFileId)
        .filter((id): id is string => id !== null && id !== undefined)
    );
    const fileIds = Array.from(fileIdsSet);
    
    if (fileIds.length === 0) {
      return [];
    }

    // Get only chunk IDs (not full chunks) to avoid loading large content
    const chunkIdResults = await this.db
      .select({ id: documentChunks.id })
      .from(documentChunks)
      .where(inArray(documentChunks.uploadedFileId, fileIds));
    
    const chunkIds = chunkIdResults.map(c => c.id);
    
    if (chunkIds.length === 0) {
      return [];
    }

    // Get entities for these chunks with limit
    let query = this.db
      .select()
      .from(entities)
      .where(inArray(entities.chunkId, chunkIds))
      .orderBy(entities.createdAt);
    
    // Apply limit if provided
    if (limit && limit > 0) {
      query = query.limit(limit) as any;
    }
    
    return await query;
  }

  async createEntity(entity: InsertEntity): Promise<Entity> {
    const data: typeof entities.$inferInsert = {
      ...entity,
      metadata: entity.metadata ? {
        unit: entity.metadata.unit,
        currency: entity.metadata.currency,
        regulation: entity.metadata.regulation,
      } : undefined,
    };
    const result = await this.db.insert(entities).values(data).returning();
    return result[0];
  }

  async deleteEntity(id: string): Promise<boolean> {
    const result = await this.db.delete(entities).where(eq(entities.id, id)).returning();
    return result.length > 0;
  }
}

// Use DbStorage for production, MemStorage for testing
export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
