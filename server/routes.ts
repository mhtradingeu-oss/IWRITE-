import type { Express, Request, Response } from "express";
import multer from "multer";
import { storage } from "./storage";
import { generateDocument, rewriteDocument, translateDocument, performQACheck } from "./ai";
import { extractTextFromFile } from "./fileProcessing";
import { insertDocumentSchema, insertTemplateSchema, insertStyleProfileSchema, exportDocumentSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { exportToMarkdown, exportToDOCX, exportToPDF } from "./export";
import { registerAuthRoutes } from "./authRoutes";
import { registerBillingRoutes } from "./billingRoutes";
import { requireAuth } from "./index";
import { checkDailyLimit } from "./limitMiddleware";

// Initialize Google Cloud Storage for file uploads (only in production)
let bucket: any = null;
(async () => {
  if (process.env.NODE_ENV === "production" && process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID) {
    const { Storage } = await import("@google-cloud/storage");
    const gcsStorage = new Storage();
    bucket = gcsStorage.bucket(process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID);
  }
})();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export async function registerRoutes(app: Express) {
  // Register auth routes first
  registerAuthRoutes(app);
  // Register billing routes
  registerBillingRoutes(app);
  // Health check (also at /healthz in index.ts, this is for consistency)
  app.get("/api/health", async (_req: Request, res: Response) => {
    res.json({ 
      status: "ok",
      timestamp: new Date().toISOString()
    });
  });

  // Protected routes - require authentication
  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const documents = await storage.getAllDocuments();
      const uploads = await storage.getAllUploadedFiles();
      const templates = await storage.getAllTemplates();
      const styleProfiles = await storage.getAllStyleProfiles();

      res.json({
        documents: documents.length,
        uploads: uploads.length,
        templates: templates.length,
        styleProfiles: styleProfiles.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/dashboard/activity", requireAuth, async (req: Request, res: Response) => {
    try {
      const documents = await storage.getAllDocuments();
      const activity = documents.slice(0, 5).map((doc) => ({
        title: `Document "${doc.title}" created`,
        timestamp: new Date(doc.createdAt).toLocaleString(),
      }));
      res.json(activity);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Documents
  app.get("/api/documents", requireAuth, async (req: Request, res: Response) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/documents/generate", requireAuth, checkDailyLimit, async (req: Request, res: Response) => {
    try {
      const { documentType, language, prompt, templateId, styleProfileId } = req.body;

      if (!documentType || !language || !prompt) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get template if provided
      let template;
      if (templateId) {
        template = await storage.getTemplate(templateId);
      }

      // Get style profile if provided
      let styleProfile;
      if (styleProfileId) {
        styleProfile = await storage.getStyleProfile(styleProfileId);
      }

      // Get uploaded files to use as source content
      const uploads = await storage.getAllUploadedFiles();
      let sourceContent = "";
      if (uploads.length > 0) {
        sourceContent = uploads
          .filter((u) => u.extractedContent)
          .map((u) => u.extractedContent)
          .join("\n\n");
      }

      // Generate document using AI
      const content = await generateDocument({
        documentType,
        language,
        prompt,
        template: template ? { header: template.header ?? undefined, footer: template.footer ?? undefined } : undefined,
        styleProfile: styleProfile ? { tone: styleProfile.tone, voice: styleProfile.voice, guidelines: styleProfile.guidelines ?? undefined } : undefined,
        sourceContent,
      });

      // Create document
      const document = await storage.createDocument({
        title: `${documentType} - ${new Date().toLocaleDateString()}`,
        content,
        documentType,
        language,
        templateId: templateId || undefined,
        styleProfileId: styleProfileId || undefined,
      });

      res.json(document);
    } catch (error: any) {
      console.error("Error generating document:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const validation = insertDocumentSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }

      const document = await storage.updateDocument(req.params.id, validation.data);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.json(document);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteDocument(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Document rewriting
  app.post("/api/documents/:id/rewrite", requireAuth, checkDailyLimit, async (req: Request, res: Response) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const { styleProfileId, removeDuplication } = req.body;

      let styleProfile;
      if (styleProfileId) {
        styleProfile = await storage.getStyleProfile(styleProfileId);
      }

      const rewrittenContent = await rewriteDocument({
        content: document.content,
        language: document.language || "en",
        styleProfile: styleProfile ? { tone: styleProfile.tone, voice: styleProfile.voice, guidelines: styleProfile.guidelines ?? undefined } : undefined,
        removeDuplication: removeDuplication || false,
      });

      // Create version before updating
      await storage.createDocumentVersion({
        documentId: document.id,
        content: document.content,
        version: 1,
        changeSummary: "Rewritten with AI",
      });

      const updated = await storage.updateDocument(req.params.id, {
        content: rewrittenContent,
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Document translation
  app.post("/api/documents/:id/translate", requireAuth, checkDailyLimit, async (req: Request, res: Response) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const { targetLanguage, styleProfileId } = req.body;

      if (!targetLanguage) {
        return res.status(400).json({ error: "Target language is required" });
      }

      let styleProfile;
      if (styleProfileId) {
        styleProfile = await storage.getStyleProfile(styleProfileId);
      }

      const translatedContent = await translateDocument({
        content: document.content,
        sourceLanguage: document.language || "en",
        targetLanguage,
        styleProfile: styleProfile ? { tone: styleProfile.tone, voice: styleProfile.voice, guidelines: styleProfile.guidelines ?? undefined } : undefined,
      });

      // Create new document with translation
      const newDocument = await storage.createDocument({
        title: `${document.title} (${targetLanguage})`,
        content: translatedContent,
        documentType: document.documentType,
        language: targetLanguage,
        templateId: document.templateId,
        styleProfileId: document.styleProfileId,
      });

      res.json(newDocument);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // QA Checks
  app.post("/api/documents/:id/qa-check", requireAuth, checkDailyLimit, async (req: Request, res: Response) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const { checkType } = req.body;

      if (!checkType) {
        return res.status(400).json({ error: "Check type is required" });
      }

      const result = await performQACheck({
        content: document.content,
        checkType,
      });

      // Save QA check result
      const qaResult = await storage.createQACheckResult({
        documentId: document.id,
        checkType,
        status: result.status,
        issues: result.issues,
      });

      res.json(qaResult);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/documents/:id/qa-results", async (req: Request, res: Response) => {
    try {
      const results = await storage.getQACheckResults(req.params.id);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Document Export
  app.post("/api/documents/:id/export", async (req: Request, res: Response) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const validation = exportDocumentSchema.safeParse({ 
        documentId: req.params.id, 
        ...req.body 
      });
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }

      const { format } = validation.data;

      // Get template if available
      let template = undefined;
      if (document.templateId) {
        template = await storage.getTemplate(document.templateId) || undefined;
      }

      let buffer: Buffer;
      let contentType: string;
      let filename: string;

      switch (format) {
        case "md":
          buffer = await exportToMarkdown(document, template);
          contentType = "text/markdown";
          filename = `${document.title.replace(/[^a-z0-9]/gi, "_")}.md`;
          break;
        case "docx":
          buffer = await exportToDOCX(document, template);
          contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          filename = `${document.title.replace(/[^a-z0-9]/gi, "_")}.docx`;
          break;
        case "pdf":
          buffer = await exportToPDF(document, template);
          contentType = "text/html"; // For now, returning HTML instead of actual PDF
          filename = `${document.title.replace(/[^a-z0-9]/gi, "_")}.html`;
          break;
        default:
          return res.status(400).json({ error: "Invalid export format" });
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error: any) {
      console.error("Export error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Templates
  app.get("/api/templates", async (req: Request, res: Response) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/templates", async (req: Request, res: Response) => {
    try {
      const validation = insertTemplateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }

      const template = await storage.createTemplate(validation.data);
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      const validation = insertTemplateSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }

      const template = await storage.updateTemplate(req.params.id, validation.data);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      res.json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Style Profiles
  app.get("/api/style-profiles", async (req: Request, res: Response) => {
    try {
      const profiles = await storage.getAllStyleProfiles();
      res.json(profiles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/style-profiles", async (req: Request, res: Response) => {
    try {
      const validation = insertStyleProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }

      const profile = await storage.createStyleProfile(validation.data);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/style-profiles/:id", async (req: Request, res: Response) => {
    try {
      const validation = insertStyleProfileSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }

      const profile = await storage.updateStyleProfile(req.params.id, validation.data);
      if (!profile) {
        return res.status(404).json({ error: "Style profile not found" });
      }

      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/style-profiles/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteStyleProfile(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Style profile not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/style-profiles/:id/preview", async (req: Request, res: Response) => {
    try {
      const profile = await storage.getStyleProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Style profile not found" });
      }

      const { generateStylePreview } = await import("./ai");
      const previewText = await generateStylePreview(profile);
      
      res.json({ preview: previewText });
    } catch (error: any) {
      console.error("Error generating preview:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // File Uploads
  app.get("/api/uploads", async (req: Request, res: Response) => {
    try {
      const uploads = await storage.getAllUploadedFiles();
      res.json(uploads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/uploads", upload.array("files", 10), async (req: Request, res: Response) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedFiles = [];

      for (const file of req.files) {
        let extractedContent = null;

        // Extract text from document files
        if (
          [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/csv",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ].includes(file.mimetype)
        ) {
          try {
            extractedContent = await extractTextFromFile(file.buffer, file.mimetype);
          } catch (error) {
            console.error(`Failed to extract text from ${file.originalname}:`, error);
          }
        }

        // Determine file type category
        let fileType = "default";
        if (file.mimetype === "application/pdf") fileType = "pdf";
        else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") fileType = "docx";
        else if (file.mimetype === "text/csv") fileType = "csv";
        else if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") fileType = "xlsx";
        else if (file.mimetype.startsWith("image/")) fileType = "image";

        // Create the uploaded file record
        const uploadedFile = await storage.createUploadedFile({
          filename: file.originalname,
          fileType,
          filePath: `memory://${file.originalname}`,
          extractedContent: extractedContent || undefined,
        });

        // Store file buffer in memory for serving
        storage.storeFileBuffer(uploadedFile.id, file.buffer, file.mimetype);

        uploadedFiles.push(uploadedFile);
      }

      res.json(uploadedFiles);
    } catch (error: any) {
      console.error("Error uploading files:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Serve uploaded files
  app.get("/api/uploads/:id/file", async (req: Request, res: Response) => {
    try {
      const fileData = storage.getFileBuffer(req.params.id);
      if (!fileData) {
        return res.status(404).json({ error: "File not found" });
      }

      res.setHeader("Content-Type", fileData.mimeType);
      res.send(fileData.buffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/uploads/:id", async (req: Request, res: Response) => {
    try {
      const file = await storage.getUploadedFile(req.params.id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      // Delete from object storage if exists
      if (file.filePath && bucket) {
        try {
          const fileName = file.filePath.split("/").pop();
          if (fileName) {
            await bucket.file(`${process.env.PRIVATE_OBJECT_DIR || ".private"}/${fileName}`).delete();
          }
        } catch (error) {
          console.error("Error deleting from object storage:", error);
        }
      }

      const deleted = await storage.deleteUploadedFile(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "File not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Archive / Versions
  app.get("/api/archive/versions", async (req: Request, res: Response) => {
    try {
      const versions = await storage.getAllVersions();
      res.json(versions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/documents/:id/versions", async (req: Request, res: Response) => {
    try {
      const versions = await storage.getDocumentVersions(req.params.id);
      res.json(versions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Topic Intelligence Routes
  // Import the service dynamically to avoid circular dependencies
  const { TopicIntelligenceService } = await import("./topic-intelligence/service.js");
  const topicService = new TopicIntelligenceService(storage);

  // Process uploaded file: chunk, embed, classify
  app.post("/api/topic-intelligence/process-file/:fileId", async (req: Request, res: Response) => {
    try {
      console.log(`[Topic Intelligence] Processing file: ${req.params.fileId}`);
      
      // Pre-check: validate file exists and has reasonable content size
      const file = await storage.getUploadedFile(req.params.fileId);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      if (!file.extractedContent) {
        return res.status(400).json({ error: "File has no extracted content. Please upload a text-based file." });
      }
      
      // Memory safety: Reject files with too much extracted content
      // CRITICAL: Must match Topic Intelligence service limit
      const MAX_CONTENT_SIZE = 100000; // 100KB (matches TopicIntelligenceService)
      if (file.extractedContent.length > MAX_CONTENT_SIZE) {
        console.warn(`File ${file.id} too large: ${file.extractedContent.length} chars. Rejecting to prevent OOM.`);
        return res.status(413).json({ 
          error: `File content too large for Topic Intelligence processing: ${file.extractedContent.length} characters. Maximum allowed: ${MAX_CONTENT_SIZE} characters (100KB). Please upload a smaller file.` 
        });
      }
      
      console.log(`[Topic Intelligence] File validated. Content size: ${file.extractedContent.length} chars`);
      
      const result = await topicService.processUploadedFile(req.params.fileId);
      console.log(`[Topic Intelligence] Processing complete. Chunks: ${result.chunks}, Topics: ${result.topics.length}, Entities: ${result.entities}`);
      res.json(result);
    } catch (error: any) {
      console.error("Error processing file:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Semantic search across all documents
  app.post("/api/topic-intelligence/search", async (req: Request, res: Response) => {
    try {
      const { query, topK, threshold, topicId } = req.body;
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" });
      }

      const results = await topicService.semanticSearch(query, {
        topK: topK || 10,
        threshold: threshold || 0.7,
        topicId,
      });

      res.json(results);
    } catch (error: any) {
      console.error("Semantic search error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Topics CRUD
  app.get("/api/topics", async (req: Request, res: Response) => {
    try {
      const topics = await storage.getAllTopics();
      res.json(topics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/topics/:id", async (req: Request, res: Response) => {
    try {
      const topic = await storage.getTopic(req.params.id);
      if (!topic) {
        return res.status(404).json({ error: "Topic not found" });
      }
      res.json(topic);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/topics", async (req: Request, res: Response) => {
    try {
      // Validate with Zod schema
      const { insertTopicSchema } = await import("@shared/schema");
      const validation = insertTopicSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: fromZodError(validation.error).toString() 
        });
      }

      const topic = await storage.createTopic(validation.data);
      res.json(topic);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/topics/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteTopic(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Topic not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Topic Packs
  app.get("/api/topic-packs", async (req: Request, res: Response) => {
    try {
      const packs = await storage.getAllTopicPacks();
      res.json(packs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/topic-packs/topic/:topicId", async (req: Request, res: Response) => {
    try {
      const packs = await storage.getTopicPacksByTopic(req.params.topicId);
      res.json(packs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/topic-packs/build/:topicId", async (req: Request, res: Response) => {
    try {
      await topicService.buildTopicPack(req.params.topicId);
      res.json({ success: true, message: "Topic pack built successfully" });
    } catch (error: any) {
      console.error("Error building topic pack:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get document chunks for a file
  app.get("/api/chunks/file/:fileId", async (req: Request, res: Response) => {
    try {
      const chunks = await storage.getChunksByFile(req.params.fileId);
      res.json(chunks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get chunks for a topic (with limit to prevent OOM)
  app.get("/api/chunks/topic/:topicId", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const chunks = await storage.getChunksByTopic(req.params.topicId, limit);
      res.json(chunks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get entities for a topic (with limit to prevent OOM)
  app.get("/api/entities/topic/:topicId", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const entities = await storage.getEntitiesByTopic(req.params.topicId, limit);
      res.json(entities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
