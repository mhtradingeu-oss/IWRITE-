import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Subscription plan types
export const subscriptionPlans = ["FREE", "PRO_MONTHLY", "PRO_YEARLY"] as const;
export type SubscriptionPlan = typeof subscriptionPlans[number];

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  plan: text("plan").notNull().default("FREE"),
  planStartedAt: timestamp("plan_started_at").notNull().defaultNow(),
  planExpiresAt: timestamp("plan_expires_at"),
  dailyUsageCount: integer("daily_usage_count").notNull().default(0),
  dailyUsageDate: text("daily_usage_date"), // YYYY-MM-DD format
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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

// Logo position and size types
export const logoPositions = ["top_left", "top_center", "top_right", "header_bar", "side"] as const;
export const logoSizes = ["small", "medium", "large"] as const;
export const fontFamilies = ["inter", "georgia", "cairo", "noto-sans-arabic", "system-ui"] as const;

export type LogoPosition = typeof logoPositions[number];
export type LogoSize = typeof logoSizes[number];
export type FontFamily = typeof fontFamilies[number];

// Templates table
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  header: text("header"),
  footer: text("footer"),
  logoUrl: text("logo_url"),
  logoPosition: text("logo_position").default("header_bar"),
  logoSize: text("logo_size").default("medium"),
  headingFontFamily: text("heading_font_family").default("inter"),
  bodyFontFamily: text("body_font_family").default("inter"),
  brandColors: jsonb("brand_colors").$type<{ primary: string; secondary: string }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Style Profiles table
export const styleProfiles = pgTable("style_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  useCase: text("use_case").default("General"),
  language: text("language").default("en"),
  region: text("region"),
  tone: text("tone").notNull(),
  formalityLevel: text("formality_level"),
  voice: text("voice").notNull(),
  targetAudience: text("target_audience"),
  purpose: text("purpose"),
  sentenceLengthPreference: text("sentence_length_preference"),
  structurePreference: text("structure_preference"),
  allowEmojis: integer("allow_emojis").default(0),
  allowSlang: integer("allow_slang").default(0),
  useMarketingLanguage: integer("use_marketing_language").default(0),
  requireDisclaimers: integer("require_disclaimers").default(0),
  preferredPhrases: text("preferred_phrases").array(),
  forbiddenPhrases: text("forbidden_phrases").array(),
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

// Topic Intelligence: Document Chunks with Embeddings
export const documentChunks = pgTable("document_chunks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id"),
  uploadedFileId: varchar("uploaded_file_id"),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  heading: text("heading"),
  embedding: jsonb("embedding").$type<number[]>(),
  metadata: jsonb("metadata").$type<{
    startChar?: number;
    endChar?: number;
    pageNumber?: number;
    section?: string;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Topics table
export const topics = pgTable("topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  keywords: text("keywords").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Document-Topic relationship (many-to-many)
export const documentTopics = pgTable("document_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id"),
  uploadedFileId: varchar("uploaded_file_id"),
  topicId: varchar("topic_id").notNull(),
  confidence: integer("confidence").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Topic Packs: Knowledge bases per topic
export const topicPacks = pgTable("topic_packs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").notNull(),
  name: text("name").notNull(),
  terminologyMap: jsonb("terminology_map").$type<Record<string, string>>(),
  priorityRules: jsonb("priority_rules").$type<Array<{
    rule: string;
    priority: number;
  }>>(),
  sampleSections: jsonb("sample_sections").$type<Array<{
    heading: string;
    content: string;
    sourceChunkIds: string[];
  }>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Extracted Entities (numbers, regulations, terms)
export const entities = pgTable("entities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chunkId: varchar("chunk_id").notNull(),
  entityType: text("entity_type").notNull(),
  value: text("value").notNull(),
  context: text("context"),
  metadata: jsonb("metadata").$type<{
    unit?: string;
    currency?: string;
    regulation?: string;
  }>(),
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
  logoPosition: true,
  logoSize: true,
  headingFontFamily: true,
  bodyFontFamily: true,
  brandColors: true,
});

export const insertStyleProfileSchema = createInsertSchema(styleProfiles).pick({
  name: true,
  useCase: true,
  language: true,
  region: true,
  tone: true,
  formalityLevel: true,
  voice: true,
  targetAudience: true,
  purpose: true,
  sentenceLengthPreference: true,
  structurePreference: true,
  allowEmojis: true,
  allowSlang: true,
  useMarketingLanguage: true,
  requireDisclaimers: true,
  preferredPhrases: true,
  forbiddenPhrases: true,
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

export const insertDocumentChunkSchema = createInsertSchema(documentChunks).pick({
  documentId: true,
  uploadedFileId: true,
  chunkIndex: true,
  content: true,
  heading: true,
  embedding: true,
  metadata: true,
});

export const insertTopicSchema = createInsertSchema(topics).pick({
  name: true,
  description: true,
  keywords: true,
});

export const insertDocumentTopicSchema = createInsertSchema(documentTopics).pick({
  documentId: true,
  uploadedFileId: true,
  topicId: true,
  confidence: true,
});

export const insertTopicPackSchema = createInsertSchema(topicPacks).pick({
  topicId: true,
  name: true,
  terminologyMap: true,
  priorityRules: true,
  sampleSections: true,
});

export const insertEntitySchema = createInsertSchema(entities).pick({
  chunkId: true,
  entityType: true,
  value: true,
  context: true,
  metadata: true,
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

// Songwriter section types
export const songDialects = [
  "khaliji",
  "egyptian",
  "levant",
  "msa",
  "de",
  "en-us",
  "en-uk",
  "other",
] as const;

export const songTypes = [
  "romantic",
  "sad-heartbreak",
  "motivational",
  "social-message",
  "rap-trap",
  "pop-dance",
  "national-inspirational",
] as const;

export const songStructures = [
  "intro-verse1-chorus-verse2-chorus",
  "verse-chorus-bridge-chorus",
  "rap-verses-hook",
  "custom",
] as const;

export const rhymePatterns = [
  "tight",
  "loose",
  "ABAB",
  "AABB",
  "AAAA",
] as const;

export type SongDialect = typeof songDialects[number];
export type SongType = typeof songTypes[number];
export type SongStructure = typeof songStructures[number];
export type RhymePattern = typeof rhymePatterns[number];

// Songwriter Feedback table
export const songwriterFeedback = pgTable("songwriter_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  styleProfileId: varchar("style_profile_id"),
  sectionType: text("section_type").notNull(), // intro, verse, chorus, bridge
  sectionContent: text("section_content").notNull(),
  rating: integer("rating").notNull(), // 1 for good, -1 for bad
  userNote: text("user_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SongwriterFeedback = typeof songwriterFeedback.$inferSelect;
export type InsertSongwriterFeedback = typeof songwriterFeedback.$inferInsert;

export const insertSongwriterFeedbackSchema = createInsertSchema(songwriterFeedback).pick({
  styleProfileId: true,
  sectionType: true,
  sectionContent: true,
  rating: true,
  userNote: true,
});

export const generateSongwriterSchema = z.object({
  songIdea: z.string().min(5, "Song idea must be at least 5 characters"),
  language: z.enum(languages),
  dialect: z.enum(songDialects),
  songType: z.enum(songTypes),
  structure: z.enum(songStructures),
  rhymePattern: z.enum(rhymePatterns),
  styleProfileId: z.string().optional(),
  customStructure: z.string().optional(),
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

export type InsertDocumentChunk = z.infer<typeof insertDocumentChunkSchema>;
export type DocumentChunk = typeof documentChunks.$inferSelect;

export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topics.$inferSelect;

export type InsertDocumentTopic = z.infer<typeof insertDocumentTopicSchema>;
export type DocumentTopic = typeof documentTopics.$inferSelect;

export type InsertTopicPack = z.infer<typeof insertTopicPackSchema>;
export type TopicPack = typeof topicPacks.$inferSelect;

export type InsertEntity = z.infer<typeof insertEntitySchema>;
export type Entity = typeof entities.$inferSelect;

export type GenerateDocumentRequest = z.infer<typeof generateDocumentSchema>;
export type RewriteDocumentRequest = z.infer<typeof rewriteDocumentSchema>;
export type TranslateDocumentRequest = z.infer<typeof translateDocumentSchema>;
export type ExportDocumentRequest = z.infer<typeof exportDocumentSchema>;
