import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from 'cors';
import { sessionMiddleware } from './auth';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS 및 세션 설정
const allowedOrigins = [
  'http://localhost:5000',
  'https://localhost:5000', 
  'https://successme.replit.app',
  /\.replit\.app$/
];

app.use(cors({
  origin: function(origin, callback) {
    // 요청 출처가 허용 목록에 있는지 확인
    if (!origin || allowedOrigins.some(allowed => 
        typeof allowed === 'string' 
          ? allowed === origin 
          : allowed.test(origin))) {
      callback(null, true);
    } else {
      console.log(`CORS blocked: ${origin}`);
      callback(null, true); // 개발 중에는 모든 출처 허용
    }
  },
  credentials: true, // 인증 정보 허용
  exposedHeaders: ['set-cookie']
}));

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
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
