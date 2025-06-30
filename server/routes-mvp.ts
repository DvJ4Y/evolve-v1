import type { Express } from "express";
import { createServer, type Server } from "http";
import { mvpStorage } from "./storage-mvp";
import { mvpWellnessService } from "./services/wellness-mvp";
import { insertUserSchema, insertMvpActivityLogSchema } from "@shared/schema";

export async function registerMVPRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const dbConnected = await mvpStorage.healthCheck();
      const aiStatus = await mvpWellnessService.getAIStatus();
      
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        services: {
          database: dbConnected,
          ai: aiStatus
        }
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Health check failed",
        error: error.message
      });
    }
  });

  // Auth routes - simplified for MVP
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { name, email, avatar } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ 
          message: "Name and email are required" 
        });
      }
      
      let user = await mvpStorage.getUserByEmail(email);
      
      if (!user) {
        // Create new user
        user = await mvpStorage.createUser({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          avatar: avatar || null
        });
        console.log(`✅ Created new user: ${user.name} (${user.email})`);
      } else {
        console.log(`✅ Existing user signed in: ${user.name} (${user.email})`);
      }
      
      res.json({ 
        user, 
        isNewUser: !user.primaryWellnessGoal 
      });
    } catch (error) {
      console.error("❌ Authentication failed:", error);
      res.status(500).json({ 
        message: "Authentication failed",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Validate user session
  app.get("/api/auth/validate/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await mvpStorage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ valid: true, user });
    } catch (error) {
      res.status(500).json({ message: "Validation failed" });
    }
  });

  // Complete onboarding
  app.post("/api/onboarding/complete", async (req, res) => {
    try {
      const { userId, age, primaryWellnessGoal } = req.body;
      
      if (!userId || !primaryWellnessGoal?.trim()) {
        return res.status(400).json({ 
          message: "User ID and wellness goal are required" 
        });
      }
      
      const user = await mvpStorage.updateUser(userId, {
        age: age ? parseInt(age) : null,
        primaryWellnessGoal: primaryWellnessGoal.trim()
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`✅ Onboarding completed for user: ${user.name}`);
      res.json({ user });
    } catch (error) {
      console.error("❌ Onboarding completion failed:", error);
      res.status(500).json({ 
        message: "Onboarding completion failed",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // MVP Voice logging with enhanced error handling
  app.post("/api/mvp/voice/log", async (req, res) => {
    try {
      const { userId, voiceText } = req.body;
      
      // Validate input
      if (!userId) {
        return res.status(400).json({ 
          success: false,
          message: "User ID is required" 
        });
      }
      
      if (!voiceText?.trim()) {
        return res.status(400).json({ 
          success: false,
          message: "Voice text is required" 
        });
      }
      
      // Validate user exists
      const user = await mvpStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }
      
      console.log(`🎤 Processing voice log for user ${user.name}: "${voiceText.substring(0, 50)}..."`);
      
      const result = await mvpWellnessService.processMVPVoiceLog(userId, voiceText.trim());
      
      console.log(`✅ Voice log processed: ${result.intent} (confidence: ${result.confidence})`);
      res.json(result);
    } catch (error) {
      console.error("❌ Voice processing failed:", error);
      res.status(500).json({ 
        success: false,
        message: "Voice processing failed",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Get MVP activities with pagination
  app.get("/api/mvp/activities/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Max 100
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const activities = await mvpStorage.getMvpActivityLogs(userId, limit);
      console.log(`📋 Retrieved ${activities.length} activities for user ${userId}`);
      
      res.json(activities);
    } catch (error) {
      console.error("❌ Failed to fetch activities:", error);
      res.status(500).json({ 
        message: "Failed to fetch activities",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // MVP Dashboard data
  app.get("/api/mvp/dashboard/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const data = await mvpWellnessService.getMVPDashboardData(userId);
      console.log(`📊 Dashboard data retrieved for user ${userId}`);
      
      res.json(data);
    } catch (error) {
      console.error("❌ Dashboard data fetch failed:", error);
      
      if (error.message === "User not found") {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(500).json({ 
          message: "Failed to load dashboard data",
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  });

  // User profile endpoints
  app.get("/api/mvp/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await mvpStorage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("❌ Failed to fetch user:", error);
      res.status(500).json({ 
        message: "Failed to fetch user",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  app.put("/api/mvp/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await mvpStorage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`✅ User ${id} updated successfully`);
      res.json(user);
    } catch (error) {
      console.error("❌ Failed to update user:", error);
      res.status(500).json({ 
        message: "Failed to update user",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}