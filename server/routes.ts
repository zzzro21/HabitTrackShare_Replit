import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { generateHabitInsights } from "./ai";
import { z } from "zod";
import { 
  insertHabitEntrySchema, 
  insertHabitNoteSchema, 
  insertDailyFeedbackSchema, 
  insertHabitInsightSchema, 
  insertUserSchema, 
  loginSchema,
  registerSchema,
  insertInviteCodeSchema
} from "@shared/schema";
import { authenticateUser, getCurrentUser, hashPassword, verifyPassword } from "./auth";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

import path from 'path';
import fs from 'fs';

export async function registerRoutes(app: Express): Promise<void> {
  // 정적 HTML 페이지 라우트
  const publicPath = path.resolve(process.cwd(), 'public');
  
  app.get('/login.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'login.html'));
  });
  
  app.get('/register.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'register.html'));
  });
  
  app.get('/api-key.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'api-key.html'));
  });
  // 인증 관련 라우트

  // 회원가입
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // 초대 코드가 포함된 스키마로 검증
      const registerData = registerSchema.parse(req.body);
      
      // 기존 사용자 확인
      const existingUser = await db.select().from(users).where(eq(users.username, registerData.username));
      if (existingUser.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: '이미 사용 중인 아이디입니다.' 
        });
      }
      
      // 이메일 중복 확인
      if (registerData.email) {
        const existingEmail = await db.select().from(users).where(eq(users.email, registerData.email));
        if (existingEmail.length > 0) {
          return res.status(400).json({ 
            success: false,
            message: '이미 사용 중인 이메일입니다.' 
          });
        }
      }
      
      // 초대 코드 검증
      const inviteCode = await storage.getInviteCodeByCode(registerData.inviteCode);
      if (!inviteCode) {
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 초대 코드입니다.'
        });
      }
      
      // 이미 사용된 초대 코드 확인
      if (inviteCode.isUsed) {
        return res.status(400).json({
          success: false,
          message: '이미 사용된 초대 코드입니다.'
        });
      }
      
      // 만료된 초대 코드 확인
      if (inviteCode.expiresAt && new Date(inviteCode.expiresAt) < new Date()) {
        return res.status(400).json({
          success: false,
          message: '만료된 초대 코드입니다.'
        });
      }
      
      // 비밀번호 해싱
      const hashedPassword = await hashPassword(registerData.password);
      
      // 사용자 생성
      const newUser = await storage.createUser({
        username: registerData.username,
        password: hashedPassword,
        email: registerData.email,
        name: registerData.name,
        avatar: "👤", // 기본 아바타
        googleApiKey: null
      });
      
      // 초대 코드 사용 처리
      await storage.useInviteCode(registerData.inviteCode, newUser.id);
      
      // 세션에 사용자 ID 저장 (자동 로그인)
      req.session.userId = newUser.id;
      
      return res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        user: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          avatar: newUser.avatar
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: '입력한 정보가 올바르지 않습니다.', 
          errors: error.errors 
        });
      }
      
      console.error('회원가입 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.' 
      });
    }
  });
  
  // 로그인
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // 사용자 조회
      const [user] = await db.select().from(users).where(eq(users.username, username));
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: '아이디 또는 비밀번호가 올바르지 않습니다.' 
        });
      }
      
      // 비밀번호 검증
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false,
          message: '아이디 또는 비밀번호가 올바르지 않습니다.' 
        });
      }
      
      // 세션에 사용자 ID 저장
      req.session.userId = user.id;
      
      return res.json({
        success: true,
        message: '로그인되었습니다.',
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email || null,
          avatar: user.avatar,
          googleApiKey: user.googleApiKey || null
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: '입력 정보가 올바르지 않습니다.', 
          errors: error.errors 
        });
      }
      
      console.error('로그인 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '로그인 중 오류가 발생했습니다. 다시 시도해주세요.' 
      });
    }
  });
  
  // 로그아웃
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('로그아웃 오류:', err);
        return res.status(500).json({ 
          success: false,
          message: '로그아웃 중 오류가 발생했습니다.' 
        });
      }
      
      return res.json({ 
        success: true,
        message: '로그아웃되었습니다.' 
      });
    });
  });
  
  // 현재 로그인한 사용자 정보 조회
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: '로그인이 필요합니다.' 
        });
      }
      
      return res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '사용자 정보를 조회하는 중 오류가 발생했습니다.' 
      });
    }
  });
  
  // 사용자 이름 업데이트
  app.post("/api/auth/update-name", authenticateUser, async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      
      if (!req.session.userId) {
        return res.status(401).json({ 
          success: false,
          message: '로그인이 필요합니다.' 
        });
      }
      
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: '이름은 2자 이상이어야 합니다.'
        });
      }
      
      // 사용자 이름 업데이트
      await db
        .update(users)
        .set({ name })
        .where(eq(users.id, req.session.userId));
      
      return res.json({ 
        success: true,
        message: '이름이 변경되었습니다.' 
      });
    } catch (error) {
      console.error('이름 변경 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '이름을 변경하는 중 오류가 발생했습니다.' 
      });
    }
  });
  
  // Google API 키 업데이트
  app.post("/api/auth/api-key", authenticateUser, async (req: Request, res: Response) => {
    try {
      const { googleApiKey } = req.body;
      
      if (!req.session.userId) {
        return res.status(401).json({ 
          success: false,
          message: '로그인이 필요합니다.' 
        });
      }
      
      // API 키 업데이트
      await db
        .update(users)
        .set({ googleApiKey })
        .where(eq(users.id, req.session.userId));
      
      return res.json({ 
        success: true,
        message: 'API 키가 저장되었습니다.' 
      });
    } catch (error) {
      console.error('API 키 업데이트 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: 'API 키를 저장하는 중 오류가 발생했습니다.' 
      });
    }
  });
  
  // 초대 코드 생성
  app.post("/api/invite-codes", authenticateUser, async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ 
          success: false,
          message: '로그인이 필요합니다.'
        });
      }
      
      // 랜덤 코드 생성 (16자리 영문+숫자)
      const randomCode = randomBytes(8).toString('hex');
      
      // 만료일 설정 (현재로부터 7일)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // 초대 코드 저장
      const inviteCode = await storage.createInviteCode({
        code: randomCode,
        createdBy: req.session.userId,
        expiresAt
      });
      
      return res.status(201).json({
        success: true,
        message: '초대 코드가 생성되었습니다.',
        inviteCode: {
          code: inviteCode.code,
          expiresAt: inviteCode.expiresAt
        }
      });
    } catch (error) {
      console.error('초대 코드 생성 오류:', error);
      return res.status(500).json({
        success: false,
        message: '초대 코드 생성 중 오류가 발생했습니다.'
      });
    }
  });
  
  // 초대 코드 유효성 검사
  app.get("/api/invite-codes/validate/:code", async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      
      // 코드 존재 여부 확인
      const inviteCode = await storage.getInviteCodeByCode(code);
      if (!inviteCode) {
        return res.status(404).json({
          success: false,
          message: '유효하지 않은 초대 코드입니다.'
        });
      }
      
      // 이미 사용된 코드인지 확인
      if (inviteCode.isUsed) {
        return res.status(400).json({
          success: false,
          message: '이미 사용된 초대 코드입니다.'
        });
      }
      
      // 만료 여부 확인
      if (inviteCode.expiresAt && new Date(inviteCode.expiresAt) < new Date()) {
        return res.status(400).json({
          success: false,
          message: '만료된 초대 코드입니다.'
        });
      }
      
      return res.json({
        success: true,
        message: '유효한 초대 코드입니다.',
        expiresAt: inviteCode.expiresAt
      });
    } catch (error) {
      console.error('초대 코드 유효성 검사 오류:', error);
      return res.status(500).json({
        success: false,
        message: '초대 코드 확인 중 오류가 발생했습니다.'
      });
    }
  });
  
  // 내가 생성한 초대 코드 목록 조회
  app.get("/api/my-invite-codes", authenticateUser, async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ 
          success: false,
          message: '로그인이 필요합니다.'
        });
      }
      
      // 사용자가 생성한 초대 코드 목록 조회
      const inviteCodes = await storage.getUserInviteCodes(req.session.userId);
      
      return res.json({
        success: true,
        inviteCodes: inviteCodes.map(code => ({
          id: code.id,
          code: code.code,
          isUsed: code.isUsed,
          createdAt: code.createdAt,
          expiresAt: code.expiresAt,
          usedBy: code.usedBy
        }))
      });
    } catch (error) {
      console.error('초대 코드 목록 조회 오류:', error);
      return res.status(500).json({
        success: false,
        message: '초대 코드 목록을 조회하는 중 오류가 발생했습니다.'
      });
    }
  });
  
  // Data initialization is now handled in storage class constructor

  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users", error: String(error) });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error(`Error fetching user ${req.params.id}:`, error);
      res.status(500).json({ message: "Error fetching user", error: String(error) });
    }
  });

  // Get all habits
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getAllHabits();
      res.json(habits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ message: "Error fetching habits", error: String(error) });
    }
  });

  // Get all habit entries for a user
  app.get("/api/users/:userId/entries", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const entries = await storage.getUserHabitEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error(`Error fetching entries for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Error fetching habit entries", error: String(error) });
    }
  });

  // Create or update a habit entry
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
      console.error("Error creating/updating habit entry:", error);
      res.status(500).json({ 
        message: "Error creating or updating habit entry", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Get habit notes for a user on a specific day
  app.get("/api/users/:userId/notes/:day", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const day = parseInt(req.params.day);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      if (isNaN(day) || day < 0 || day > 55) {
        return res.status(400).json({ message: "Day must be between 0 and 55" });
      }
      
      const notes = await storage.getUserHabitNotes(userId, day);
      res.json(notes);
    } catch (error) {
      console.error(`Error fetching notes for user ${req.params.userId}, day ${req.params.day}:`, error);
      res.status(500).json({ message: "Error fetching habit notes", error: String(error) });
    }
  });
  
  // Get a specific habit note
  app.get("/api/users/:userId/habits/:habitId/notes/:day", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const habitId = parseInt(req.params.habitId);
      const day = parseInt(req.params.day);
      
      if (isNaN(userId) || isNaN(habitId) || isNaN(day)) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      if (day < 0 || day > 55) {
        return res.status(400).json({ message: "Day must be between 0 and 55" });
      }
      
      const note = await storage.getHabitNote(userId, habitId, day);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      console.error(`Error fetching specific note:`, error);
      res.status(500).json({ message: "Error fetching habit note", error: String(error) });
    }
  });
  
  // Create or update a habit note
  app.post("/api/notes", async (req, res) => {
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
      console.error("Error creating/updating habit note:", error);
      res.status(500).json({ 
        message: "Error creating or updating habit note", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Get daily feedback for a user on a specific day
  app.get("/api/users/:userId/feedback/:day", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const day = parseInt(req.params.day);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      if (isNaN(day) || day < 0 || day > 55) {
        return res.status(400).json({ message: "Day must be between 0 and 55" });
      }
      
      const feedback = await storage.getDailyFeedback(userId, day);
      if (!feedback) {
        return res.json({ feedback: "" });
      }
      
      res.json(feedback);
    } catch (error) {
      console.error(`Error fetching feedback for user ${req.params.userId}, day ${req.params.day}:`, error);
      res.status(500).json({ message: "Error fetching daily feedback", error: String(error) });
    }
  });
  
  // Create or update daily feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const validatedData = insertDailyFeedbackSchema.parse(req.body);
      
      // Validate that user exists
      const user = await storage.getUser(validatedData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate day is within range (0-55)
      if (validatedData.day < 0 || validatedData.day > 55) {
        return res.status(400).json({ message: "Day must be between 0 and 55" });
      }
      
      const feedback = await storage.createOrUpdateDailyFeedback(validatedData);
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error creating/updating daily feedback:", error);
      res.status(500).json({ 
        message: "Error creating or updating daily feedback", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Get habit insights for a user
  app.get("/api/users/:userId/insights", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
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
      try {
        const insights = await generateHabitInsights(userId, storage);
        const savedInsights = await storage.createOrUpdateHabitInsight(insights);
        return res.json(savedInsights);
      } catch (error) {
        console.error("Error in habit insights generation:", error);
        // 기본 인사이트 제공
        const defaultInsights = {
          userId,
          summary: "인사이트 생성 중 오류가 발생했습니다.",
          strengths: ["데이터를 계속 기록해주세요."],
          improvementAreas: ["더 많은 데이터가 필요합니다."],
          recommendations: ["매일 습관을 기록하세요."],
          date: new Date()
        };
        const savedDefaultInsights = await storage.createOrUpdateHabitInsight(defaultInsights);
        return res.json(savedDefaultInsights);
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      return res.status(500).json({ 
        message: "Error generating insights", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Manually create habit insights (mostly for testing)
  app.post("/api/insights", async (req, res) => {
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
      console.error("Error creating/updating habit insight:", error);
      res.status(500).json({ 
        message: "Error creating or updating habit insight", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Routes registered successfully
}
