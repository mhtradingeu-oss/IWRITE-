import type { Express, Request, Response } from "express";
import multer from "multer";
import { storage } from "./storage";
import { generateDocument, rewriteDocument, translateDocument, performQACheck } from "./ai";
import { extractTextFromFile } from "./fileProcessing";
import { insertDocumentSchema, insertTemplateSchema, insertStyleProfileSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Initialize Google Cloud Storage for file uploads (only in production)
let bucket: any = null;
if (process.env.NODE_ENV === "production" && process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID) {
  const { Storage } = await import("@google-cloud/storage");
  const gcsStorage = new Storage();
  bucket = gcsStorage.bucket(process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID);
}

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

export function registerRoutes(app: Express) {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
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

  app.get("/api/dashboard/activity", async (req: Request, res: Response) => {
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
  app.get("/api/documents", async (req: Request, res: Response) => {
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

  app.post("/api/documents/generate", async (req: Request, res: Response) => {
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
        template,
        styleProfile,
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
  app.post("/api/documents/:id/rewrite", async (req: Request, res: Response) => {
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
        styleProfile,
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
  app.post("/api/documents/:id/translate", async (req: Request, res: Response) => {
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
        styleProfile,
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
  app.post("/api/documents/:id/qa-check", async (req: Request, res: Response) => {
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

        // Upload to object storage if bucket is available, otherwise store in memory
        let storageUrl = "";
        if (bucket) {
          try {
            const fileName = `${Date.now()}-${file.originalname}`;
            const blob = bucket.file(`${process.env.PRIVATE_OBJECT_DIR || ".private"}/${fileName}`);
            await blob.save(file.buffer, {
              contentType: file.mimetype,
            });
            storageUrl = `gs://${process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID}/${process.env.PRIVATE_OBJECT_DIR || ".private"}/${fileName}`;
          } catch (error) {
            console.error("Error uploading to object storage:", error);
            // Fall back to in-memory storage
            storageUrl = `memory://${Date.now()}-${file.originalname}`;
          }
        } else {
          // Development mode: store reference in memory
          storageUrl = `memory://${Date.now()}-${file.originalname}`;
        }

        // Determine file type category
        let fileType = "default";
        if (file.mimetype === "application/pdf") fileType = "pdf";
        else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") fileType = "docx";
        else if (file.mimetype === "text/csv") fileType = "csv";
        else if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") fileType = "xlsx";
        else if (file.mimetype.startsWith("image/")) fileType = "image";

        const uploadedFile = await storage.createUploadedFile({
          filename: file.originalname,
          fileType,
          storageUrl: storageUrl || undefined,
          extractedContent: extractedContent || undefined,
        });

        uploadedFiles.push(uploadedFile);
      }

      res.json(uploadedFiles);
    } catch (error: any) {
      console.error("Error uploading files:", error);
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
      if (file.storageUrl && bucket) {
        try {
          const fileName = file.storageUrl.split("/").pop();
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
}
