import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Document types supported by the system
export const documentTypes = [
  "blog",
  "proposal",
  "contract",
  "policy",
  "presentation",
  "product-page",
  "social-media",
] as const;

export type DocumentType = typeof documentTypes[number];

// Supported languages
export const languages = ["ar", "en", "de"] as const;
export type Language = typeof languages[number];

// QA check types
export const qaCheckTypes = [
  "medical-claims",
  "disclaimer",
  "number-consistency",
  "product-code-cnpn",
] as const;

export type QACheckType = typeof qaCheckTypes[number];

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  documentType: text("document_type").notNull(),
  language: text("language").notNull().default("en"),
  templateId: varchar("template_id"),
  styleProfileId: varchar("style_profile_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Templates table
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  header: text("header"),
  footer: text("footer"),
  logoUrl: text("logo_url"),
  brandColors: jsonb("brand_colors").$type<{ primary: string; secondary: string }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Style Profiles table
export const styleProfiles = pgTable("style_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  tone: text("tone").notNull(),
  voice: text("voice").notNull(),
  guidelines: text("guidelines"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Uploaded Files table
export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(),
  filePath: text("file_path").notNull(),
  extractedContent: text("extracted_content"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Document Versions table
export const documentVersions = pgTable("document_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  version: integer("version").notNull(),
  content: text("content").notNull(),
  changeSummary: text("change_summary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// QA Checks Results table
export const qaCheckResults = pgTable("qa_check_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  checkType: text("check_type").notNull(),
  status: text("status").notNull(),
  issues: jsonb("issues").$type<Array<{ description: string; severity: string; suggestion: string }>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  content: true,
  documentType: true,
  language: true,
  templateId: true,
  styleProfileId: true,
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  header: true,
  footer: true,
  logoUrl: true,
  brandColors: true,
});

export const insertStyleProfileSchema = createInsertSchema(styleProfiles).pick({
  name: true,
  tone: true,
  voice: true,
  guidelines: true,
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).pick({
  filename: true,
  fileType: true,
  filePath: true,
  extractedContent: true,
});

export const insertDocumentVersionSchema = createInsertSchema(documentVersions).pick({
  documentId: true,
  version: true,
  content: true,
  changeSummary: true,
});

export const insertQACheckResultSchema = createInsertSchema(qaCheckResults).pick({
  documentId: true,
  checkType: true,
  status: true,
  issues: true,
});

// Extended schemas with validation
export const generateDocumentSchema = z.object({
  documentType: z.enum(documentTypes),
  language: z.enum(languages),
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  templateId: z.string().optional(),
  styleProfileId: z.string().optional(),
  sourceFileIds: z.array(z.string()).optional(),
});

export const rewriteDocumentSchema = z.object({
  content: z.string().min(1),
  language: z.enum(languages),
  styleProfileId: z.string().optional(),
  removeDuplication: z.boolean().default(true),
});

export const translateDocumentSchema = z.object({
  content: z.string().min(1),
  sourceLanguage: z.enum(languages),
  targetLanguage: z.enum(languages),
  styleProfileId: z.string().optional(),
});

export const exportDocumentSchema = z.object({
  documentId: z.string(),
  format: z.enum(["md", "docx", "pdf"]),
});

// Type exports
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

export type InsertStyleProfile = z.infer<typeof insertStyleProfileSchema>;
export type StyleProfile = typeof styleProfiles.$inferSelect;

export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;
export type UploadedFile = typeof uploadedFiles.$inferSelect;

export type InsertDocumentVersion = z.infer<typeof insertDocumentVersionSchema>;
export type DocumentVersion = typeof documentVersions.$inferSelect;

export type InsertQACheckResult = z.infer<typeof insertQACheckResultSchema>;
export type QACheckResult = typeof qaCheckResults.$inferSelect;

export type GenerateDocumentRequest = z.infer<typeof generateDocumentSchema>;
export type RewriteDocumentRequest = z.infer<typeof rewriteDocumentSchema>;
export type TranslateDocumentRequest = z.infer<typeof translateDocumentSchema>;
export type ExportDocumentRequest = z.infer<typeof exportDocumentSchema>;
