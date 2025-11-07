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
  documents,
  templates,
  styleProfiles,
  uploadedFiles,
  documentVersions,
  qaCheckResults,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc } from "drizzle-orm";

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
}

export class MemStorage implements IStorage {
  private documents: Map<string, Document>;
  private templates: Map<string, Template>;
  private styleProfiles: Map<string, StyleProfile>;
  private uploadedFiles: Map<string, UploadedFile>;
  private documentVersions: Map<string, DocumentVersion>;
  private qaCheckResults: Map<string, QACheckResult>;

  constructor() {
    this.documents = new Map();
    this.templates = new Map();
    this.styleProfiles = new Map();
    this.uploadedFiles = new Map();
    this.documentVersions = new Map();
    this.qaCheckResults = new Map();
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
      issues: result.issues || null,
      createdAt: new Date(),
    };
    this.qaCheckResults.set(id, newResult);
    return newResult;
  }
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
    const qr = await this.db.insert(qaCheckResults).values(result).returning();
    return qr[0];
  }
}

// Use DbStorage for production, MemStorage for testing
export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
