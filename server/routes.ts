import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateHabitInsights } from "./ai";
import { z } from "zod";
import { insertHabitEntrySchema, insertHabitNoteSchema, insertDailyFeedbackSchema, insertHabitInsightSchema } from "@shared/schema";
import { sessionMiddleware, login, logout, getCurrentUser, checkAuthStatus, isAuthenticated, onlySelfModify, allowFeedbackForAny } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // 모든 응답에 CORS 헤더 추가
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });
  
  // SPA 라우팅을 위한 처리: 클라이언트 라우트에 대한 모든 GET 요청을 index.html로 리다이렉트
  app.get(['/home', '/friends', '/ranking', '/insights', '/settings', '/notes'], (req, res, next) => {
    if (req.accepts('html')) {
      res.sendFile('index.html', { root: './client/dist' });
    } else {
      next();
    }
  });
  
  // Initialize predefined data
  await storage.initializePredefinedData();
  
  // 사용자 캐릭터 업데이트를 위한 관리자 전용 엔드포인트
  app.get('/api/admin/update-avatars', async (req, res) => {
    try {
      await storage.initializePredefinedData();
      res.json({ success: true, message: '사용자 아바타가 업데이트되었습니다.' });
    } catch (error) {
      console.error('아바타 업데이트 오류:', error);
      res.status(500).json({ success: false, message: '사용자 아바타 업데이트 중 오류가 발생했습니다.' });
    }
  });
  
  // 기본 사용자 정보 제공 (인증 없이)
  app.get("/api/auth/user", (req, res) => {
    res.json({
      id: 6,
      name: '김유나',
      username: 'zzzro',
      avatar: '👩‍🦳'
    });
  });
  
  app.get("/api/auth/status", (req, res) => {
    res.json({ isAuthenticated: true });
  });
  
  // 비밀번호 변경 API
  app.post("/api/auth/change-password", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요." });
      }
      
      // 현재 사용자 정보 확인
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
      }
      
      // 현재 비밀번호 확인
      if (user.password !== currentPassword) {
        return res.status(401).json({ success: false, message: "현재 비밀번호가 일치하지 않습니다." });
      }
      
      // 비밀번호 변경
      const success = await storage.updateUserPassword(userId, newPassword);
      
      if (success) {
        return res.status(200).json({ success: true, message: "비밀번호가 성공적으로 변경되었습니다." });
      } else {
        return res.status(500).json({ success: false, message: "비밀번호 변경 중 오류가 발생했습니다." });
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
    }
  });
  
  // 사용자 이름 변경 API (가입 후 1회만 가능)
  app.post("/api/auth/change-username", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { newUsername, password } = req.body;
      
      if (!newUsername || !password) {
        return res.status(400).json({ success: false, message: "새 아이디와 비밀번호를 모두 입력해주세요." });
      }
      
      // 현재 사용자 정보 확인
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
      }
      
      // 비밀번호 확인
      if (user.password !== password) {
        return res.status(401).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
      }
      
      // 사용자 이름 변경
      const result = await storage.updateUsername(userId, newUsername);
      
      if (result.success) {
        // 세션 업데이트를 위해 로그아웃 후 재로그인 필요
        req.session.destroy((err) => {
          if (err) {
            console.error("세션 삭제 오류:", err);
            return res.status(500).json({ success: false, message: "세션 갱신 중 오류가 발생했습니다." });
          }
          return res.status(200).json({ success: true, message: result.message, requireRelogin: true });
        });
      } else {
        return res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("사용자 이름 변경 오류:", error);
      return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
    }
  });

  // Get all users
  app.get("/api/users", async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  });

  // Get all habits
  app.get("/api/habits", async (req, res) => {
    const habits = await storage.getAllHabits();
    res.json(habits);
  });

  // Get all habit entries for a user (인증 없이 접근 가능)
  app.get("/api/users/:userId/entries", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // 모든 사용자 데이터에 접근 가능
    const entries = await storage.getUserHabitEntries(userId);
    res.json(entries);
  });

  // Create or update a habit entry (인증 불필요)
  app.post("/api/entries", async (req, res) => {
    try {
      const validatedData = insertHabitEntrySchema.parse(req.body);
      
      // Validate that user exists
      const user = await storage.getUser(validatedData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate that habit exists
      const habit = await storage.getHabit(validatedData.habitId);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Validate day is within range (0-55)
      if (validatedData.day < 0 || validatedData.day > 55) {
        return res.status(400).json({ message: "Day must be between 0 and 55" });
      }
      
      // Validate value is valid (0, 1, or 2)
      if (![0, 1, 2].includes(validatedData.value)) {
        return res.status(400).json({ message: "Value must be 0, 1, or 2" });
      }
      
      const entry = await storage.createOrUpdateHabitEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      throw error;
    }
  });

  // Get habit notes for a user on a specific day (인증 불필요)
  app.get("/api/users/:userId/notes/:day", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const day = parseInt(req.params.day);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // 자신의 데이터만 접근 가능하도록 제한
    if (userId !== req.session.userId) {
      return res.status(403).json({ message: "접근 권한이 없습니다. 자신의 데이터만 볼 수 있습니다." });
    }
    
    if (isNaN(day) || day < 0 || day > 55) {
      return res.status(400).json({ message: "Day must be between 0 and 55" });
    }
    
    const notes = await storage.getUserHabitNotes(userId, day);
    res.json(notes);
  });
  
  // Get a specific habit note (인증 불필요)
  app.get("/api/users/:userId/habits/:habitId/notes/:day", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const habitId = parseInt(req.params.habitId);
    const day = parseInt(req.params.day);
    
    if (isNaN(userId) || isNaN(habitId) || isNaN(day)) {
      return res.status(400).json({ message: "Invalid parameters" });
    }
    
    // 자신의 데이터만 접근 가능하도록 제한
    if (userId !== req.session.userId) {
      return res.status(403).json({ message: "접근 권한이 없습니다. 자신의 데이터만 볼 수 있습니다." });
    }
    
    if (day < 0 || day > 55) {
      return res.status(400).json({ message: "Day must be between 0 and 55" });
    }
    
    const note = await storage.getHabitNote(userId, habitId, day);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    res.json(note);
  });
  
  // Create or update a habit note (인증 필요 + 자신의 데이터만 수정 가능)
  app.post("/api/notes", isAuthenticated, onlySelfModify, async (req, res) => {
    try {
      const validatedData = insertHabitNoteSchema.parse(req.body);
      
      // Validate that user exists
      const user = await storage.getUser(validatedData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate that habit exists
      const habit = await storage.getHabit(validatedData.habitId);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Validate day is within range (0-55)
      if (validatedData.day < 0 || validatedData.day > 55) {
        return res.status(400).json({ message: "Day must be between 0 and 55" });
      }
      
      const note = await storage.createOrUpdateHabitNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      throw error;
    }
  });

  // Get daily feedback for a user on a specific day (인증 필요)
  app.get("/api/users/:userId/feedback/:day", isAuthenticated, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const day = parseInt(req.params.day);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // 자신의 데이터만 접근 가능하도록 제한
    if (userId !== req.session.userId) {
      return res.status(403).json({ message: "접근 권한이 없습니다. 자신의 데이터만 볼 수 있습니다." });
    }
    
    if (isNaN(day) || day < 0 || day > 55) {
      return res.status(400).json({ message: "Day must be between 0 and 55" });
    }
    
    const feedback = await storage.getDailyFeedback(userId, day);
    if (!feedback) {
      return res.json({ feedback: "" });
    }
    
    res.json(feedback);
  });
  
  // Create or update daily feedback (인증 필요) - 친구의 소감/피드백 작성 가능
  app.post("/api/feedback", isAuthenticated, allowFeedbackForAny, async (req, res) => {
    try {
      const validatedData = insertDailyFeedbackSchema.parse(req.body);
      
      // 인증 확인
      if (!req.session.userId) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }
      
      // Validate that user exists
      const user = await storage.getUser(validatedData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate day is within range (0-55)
      if (validatedData.day < 0 || validatedData.day > 55) {
        return res.status(400).json({ message: "Day must be between 0 and 55" });
      }
      
      // 소감/피드백은 친구 데이터에 작성 가능 (다른 접근 제한 없음)
      const feedback = await storage.createOrUpdateDailyFeedback(validatedData);
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      throw error;
    }
  });

  // Get habit insights for a user (인증 필요)
  app.get("/api/users/:userId/insights", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // 자신의 데이터만 접근 가능하도록 제한
      if (userId !== req.session.userId) {
        return res.status(403).json({ message: "접근 권한이 없습니다. 자신의 인사이트만 볼 수 있습니다." });
      }
      
      // Check if the user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if we already have recent insights
      const existingInsight = await storage.getUserHabitInsight(userId);
      
      // If there are existing insights and they're less than 1 day old, return them
      if (existingInsight && 
          (new Date().getTime() - new Date(existingInsight.date).getTime() < 24 * 60 * 60 * 1000)) {
        return res.json(existingInsight);
      }
      
      // Otherwise, generate new insights
      const insights = await generateHabitInsights(userId, storage);
      const savedInsights = await storage.createOrUpdateHabitInsight(insights);
      
      res.json(savedInsights);
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ 
        message: "Error generating insights", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Manually create habit insights (mostly for testing) (인증 필요)
  app.post("/api/insights", isAuthenticated, onlySelfModify, async (req, res) => {
    try {
      const validatedData = insertHabitInsightSchema.parse(req.body);
      
      // Validate that user exists
      const user = await storage.getUser(validatedData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const insight = await storage.createOrUpdateHabitInsight(validatedData);
      res.status(201).json(insight);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      throw error;
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
