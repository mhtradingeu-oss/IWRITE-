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
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export const storage = new MemStorage();
