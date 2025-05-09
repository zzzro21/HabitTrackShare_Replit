import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertHabitEntrySchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
