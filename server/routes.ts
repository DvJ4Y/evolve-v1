import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { wellnessService } from "./services/wellness";
import { geminiService } from "./services/gemini";
import { insertUserSchema, insertActivityLogSchema, insertGoalSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = req.body;
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user for demo purposes
        user = await storage.createUser({
          name: "New User",
          email,
          goals: {
            body: ["Stay healthy"],
            mind: ["Reduce stress"],
            soul: ["Practice gratitude"]
          }
        });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const data = await wellnessService.getDashboardData(userId);
      res.json(data);
    } catch (error) {
      res.status(404).json({ message: "User not found" });
    }
  });

  // Voice logging
  app.post("/api/voice/log", async (req, res) => {
    try {
      const { userId, voiceText } = req.body;
      
      if (!userId || !voiceText) {
        return res.status(400).json({ message: "userId and voiceText are required" });
      }
      
      const result = await wellnessService.processVoiceLog(userId, voiceText);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Voice processing failed" });
    }
  });

  // Activity logging
  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertActivityLogSchema.parse(req.body);
      const activity = await storage.createActivityLog(validatedData);
      
      // Update daily stats
      await wellnessService.updateDailyStats(validatedData.userId);
      
      res.json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  // Get activities
  app.get("/api/activities/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const pillar = req.query.pillar as string;
      const limit = parseInt(req.query.limit as string) || 50;
      
      let activities;
      if (pillar && ["BODY", "MIND", "SOUL"].includes(pillar)) {
        activities = await storage.getActivityLogsByPillar(userId, pillar as any);
      } else {
        activities = await storage.getActivityLogs(userId, limit);
      }
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Pillar data
  app.get("/api/pillar/:userId/:pillar", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const pillar = req.params.pillar.toUpperCase() as "BODY" | "MIND" | "SOUL";
      
      if (!["BODY", "MIND", "SOUL"].includes(pillar)) {
        return res.status(400).json({ message: "Invalid pillar type" });
      }
      
      const data = await wellnessService.getPillarData(userId, pillar);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pillar data" });
    }
  });

  // Goals management
  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data" });
    }
  });

  app.get("/api/goals/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const goals = await storage.getGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Daily stats
  app.get("/api/stats/:userId/:date", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const date = req.params.date;
      const stats = await storage.getDailyStats(userId, date);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Weekly stats
  app.get("/api/stats/:userId/range/:startDate/:endDate", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const startDate = req.params.startDate;
      const endDate = req.params.endDate;
      const stats = await storage.getDailyStatsRange(userId, startDate, endDate);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats range" });
    }
  });

  // User profile
  app.get("/api/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // AI insights
  app.get("/api/insights/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const insights = await geminiService.generateWellnessInsights(userId);
      res.json({ insights });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  // Onboarding goal parsing
  app.post("/api/onboarding/parse-goals", async (req, res) => {
    try {
      const { goalsText } = req.body;
      const parsedGoals = await geminiService.parseOnboardingGoals(goalsText);
      res.json(parsedGoals);
    } catch (error) {
      res.status(500).json({ message: "Failed to parse goals" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
