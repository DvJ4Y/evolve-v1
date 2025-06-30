import { mvpStorage } from "../storage-mvp";
import { geminiMVPService } from "./gemini-mvp";
import { type InsertMvpActivityLog, type MVPIntentType } from "@shared/schema";

export interface MVPVoiceLogResult {
  success: boolean;
  intent: MVPIntentType;
  keywords: string[];
  message: string;
  confidence: number;
}

export class MVPWellnessService {
  async processMVPVoiceLog(userId: number, voiceText: string): Promise<MVPVoiceLogResult> {
    try {
      // Get user's primary goal for context
      const user = await mvpStorage.getUser(userId);
      const userGoal = user?.primaryWellnessGoal;

      // Use Gemini to parse the voice input
      const parseResult = await geminiMVPService.parseActivityIntent(voiceText, userGoal);
      
      // Log the activity
      const activityLog: InsertMvpActivityLog = {
        userId,
        rawTextInput: voiceText,
        detectedIntent: parseResult.intent,
        extractedKeywords: {
          keywords: parseResult.keywords,
          duration: parseResult.duration,
          intensity: parseResult.intensity,
          quantity: parseResult.quantity
        }
      };
      
      await mvpStorage.createMvpActivityLog(activityLog);
      
      // Generate confirmation message
      const intentLabels = {
        workout: "workout",
        food_intake: "food intake",
        supplement_intake: "supplement",
        meditation: "meditation",
        general_activity_log: "activity"
      };
      
      const message = `Logged: "${voiceText}" as ${intentLabels[parseResult.intent]}`;
      
      return {
        success: true,
        intent: parseResult.intent,
        keywords: parseResult.keywords,
        message,
        confidence: parseResult.confidence
      };
    } catch (error) {
      console.error("Error processing MVP voice log:", error);
      return {
        success: false,
        intent: "general_activity_log",
        keywords: [],
        message: "Sorry, I couldn't process that. Please try again.",
        confidence: 0
      };
    }
  }

  async getMVPDashboardData(userId: number) {
    const user = await mvpStorage.getUser(userId);
    if (!user) throw new Error("User not found");

    const recentActivities = await mvpStorage.getMvpActivityLogs(userId, 10);

    return {
      user,
      recentActivities,
      totalActivities: recentActivities.length
    };
  }
}

export const mvpWellnessService = new MVPWellnessService();