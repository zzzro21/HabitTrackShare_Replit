import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

// Create Express application
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add logging middleware
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

// Create HTTP server with the Express app
const port = 5000;
const server = createServer(app);

// Health check endpoint for quick response
app.get('/health', (req, res) => {
  res.send('OK');
});

// Start listening on port 5000
server.listen(port, "0.0.0.0", () => {
  log(`Server started on port ${port}`);
  
  // Initialize data after server is already listening
  Promise.resolve().then(async () => {
    try {
      await storage.initializePredefinedData();
      log('Predefined data initialized');
      
      await registerRoutes(app);
      log('Routes registered');
      
      // Add error handler
      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error("Server error:", err);
        res.status(status).json({ message });
      });
      
      // Setup Vite for development
      if (app.get("env") === "development") {
        await setupVite(app, server);
      } else {
        serveStatic(app);
      }
      
      log("Server fully initialized and ready");
    } catch (err) {
      console.error("Error during server initialization:", err);
    }
  });
});
