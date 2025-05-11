import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateHabitInsights } from "./ai";
import { z } from "zod";
import { insertHabitEntrySchema, insertHabitNoteSchema, insertDailyFeedbackSchema, insertHabitInsightSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize predefined data
  await storage.initializePredefinedData();

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

  // Get all habit entries for a user
  app.get("/api/users/:userId/entries", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const entries = await storage.getUserHabitEntries(userId);
    res.json(entries);
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
      throw error;
    }
  });

  // Get habit notes for a user on a specific day
  app.get("/api/users/:userId/notes/:day", async (req, res) => {
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
  });
  
  // Get a specific habit note
  app.get("/api/users/:userId/habits/:habitId/notes/:day", async (req, res) => {
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
      throw error;
    }
  });

  // Get daily feedback for a user on a specific day
  app.get("/api/users/:userId/feedback/:day", async (req, res) => {
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
      throw error;
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
      throw error;
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
