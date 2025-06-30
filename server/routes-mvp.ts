import type { Express } from "express";
import { createServer, type Server } from "http";
import { mvpStorage } from "./storage-mvp";
import { mvpWellnessService } from "./services/wellness-mvp";
import { insertUserSchema, insertMvpActivityLogSchema } from "@shared/schema";

export async function registerMVPRoutes(app: Express): Promise<Server> {
  // Auth routes - simplified for MVP
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { name, email, avatar } = req.body;
      
      let user = await mvpStorage.getUserByEmail(email);
      
      if (!user) {
        // Create new user
        user = await mvpStorage.createUser({
          name,
          email,
          avatar
        });
      }
      
      res.json({ user, isNewUser: !user.primaryWellnessGoal });
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Complete onboarding
  app.post("/api/onboarding/complete", async (req, res) => {
    try {
      const { userId, age, primaryWellnessGoal } = req.body;
      
      const user = await mvpStorage.updateUser(userId, {
        age,
        primaryWellnessGoal
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Onboarding completion failed" });
    }
  });

  // MVP Voice logging
  app.post("/api/mvp/voice/log", async (req, res) => {
    try {
      const { userId, voiceText } = req.body;
      
      if (!userId || !voiceText) {
        return res.status(400).json({ message: "userId and voiceText are required" });
      }
      
      const result = await mvpWellnessService.processMVPVoiceLog(userId, voiceText);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Voice processing failed" });
    }
  });

  // Get MVP activities
  app.get("/api/mvp/activities/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 20;
      
      const activities = await mvpStorage.getMvpActivityLogs(userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // MVP Dashboard data
  app.get("/api/mvp/dashboard/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const data = await mvpWellnessService.getMVPDashboardData(userId);
      res.json(data);
    } catch (error) {
      res.status(404).json({ message: "User not found" });
    }
  });

  // User profile
  app.get("/api/mvp/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await mvpStorage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/mvp/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await mvpStorage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}