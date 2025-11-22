import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { config } from "./config";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Security: Set Node environment
app.set("env", config.nodeEnv);

// Security: Limit request sizes to prevent DoS
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Security: Add CORS headers (if not behind reverse proxy)
app.use((req, res, next) => {
  if (config.corsOrigin === '*' && config.nodeEnv === 'production') {
    console.warn('⚠ CORS is set to "*" in production. Consider restricting this via CORS_ORIGIN env var.');
  }
  
  res.header('Access-Control-Allow-Origin', config.corsOrigin as string);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Health check endpoint (no auth required)
  app.get("/healthz", async (_req: Request, res: Response) => {
    try {
      res.status(200).json({ 
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
      });
    } catch (error: any) {
      res.status(503).json({ 
        status: "error",
        message: error.message || "Health check failed"
      });
    }
  });

  await registerRoutes(app);

  // Global error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Don't expose internal error details in production
    if (config.nodeEnv === 'production' && status === 500) {
      console.error('Unhandled error:', err);
      message = "Internal Server Error";
    }

    res.status(status).json({ message });
  });

  const port = config.port;
  const server = app.listen(port, "0.0.0.0", () => {
    log(`🚀 IWRITE server running on port ${port}`);
    log(`📍 Environment: ${config.nodeEnv}`);
    log(`🔗 Health check: http://localhost:${port}/healthz`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });

  // Only setup vite in development and after setting up all the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();
