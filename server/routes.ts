import type { Express } from "express";
import { storage } from "./storage";
import { generateHabitInsights } from "./ai";
import { z } from "zod";
import { insertHabitEntrySchema, insertHabitNoteSchema, insertDailyFeedbackSchema, insertHabitInsightSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<void> {
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
