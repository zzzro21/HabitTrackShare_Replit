import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { testDatabaseConnection } from "./db";
import { setupSession } from "./session";

// 빠른 서버 시작을 위한 간소화된 초기화 프로세스
// 최대한 빠르게 포트를 열어 워크플로우가 서버를 감지할 수 있도록 함
async function startServer() {
  try {
    // Express 앱 생성
    const app = express();
    const port = process.env.PORT || 3000;
    
    // 필수 미들웨어만 먼저 등록
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // 빠른 응답을 위한 헬스체크 엔드포인트
    app.get('/health', (req, res) => {
      res.send('OK');
    });
    
    // HTTP 서버 생성
    const server = createServer(app);
    
    // 서버 시작 - 포트 오픈을 최우선
    server.listen(port, "0.0.0.0", () => {
      log(`Server started on port ${port}`);
      
      // 서버가 시작된 후 나머지 초기화 작업 비동기 수행
      Promise.resolve().then(async () => {
        try {
          // 세션 설정
          app.use(setupSession());
          
          // 로깅 미들웨어
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
          
          // 데이터베이스 연결 테스트
          const dbConnected = await testDatabaseConnection();
          if (dbConnected) {
            log('Database connection successful');
          } else {
            log('Database connection failed, but continuing with fallback storage');
          }
          
          // 미리 정의된 데이터 초기화
          await storage.initializePredefinedData();
          log('Predefined data initialized');
          
          // 라우트 등록
          await registerRoutes(app);
          log('Routes registered');
          
          // 에러 핸들러 등록
          app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
            const status = err.status || err.statusCode || 500;
            const message = err.message || "Internal Server Error";
            console.error("Server error:", err);
            res.status(status).json({ message });
          });
          
          // Vite 설정 (개발 환경)
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
  } catch (error) {
    console.error("Fatal error starting server:", error);
    process.exit(1);
  }
}

// 서버 시작
startServer();
