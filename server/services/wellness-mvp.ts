import { mvpStorage } from "../storage-mvp";
import { geminiMVPService } from "./gemini-mvp";
import { type InsertMvpActivityLog, type MVPIntentType } from "@shared/schema";

export interface MVPVoiceLogResult {
  success: boolean;
  intent: MVPIntentType;
  keywords: string[];
  message: string;
  confidence: number;
  source?: 'ai' | 'fallback';
}

export class MVPWellnessService {
  async processMVPVoiceLog(userId: number, voiceText: string): Promise<MVPVoiceLogResult> {
    try {
      // Validate input
      if (!voiceText || voiceText.trim().length === 0) {
        throw new Error("Voice text cannot be empty");
      }

      if (voiceText.length > 1000) {
        throw new Error("Voice text too long (max 1000 characters)");
      }

      // Get user's primary goal for context
      const user = await mvpStorage.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const userGoal = user.primaryWellnessGoal;

      console.log(`🤖 Processing voice input for ${user.name}: "${voiceText.substring(0, 50)}..."`);

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
      
      const savedActivity = await mvpStorage.createMvpActivityLog(activityLog);
      
      // Generate confirmation message based on intent and confidence
      const intentLabels = {
        workout: "workout activity",
        food_intake: "food intake",
        supplement_intake: "supplement",
        meditation: "meditation session",
        general_activity_log: "wellness activity"
      };
      
      const confidenceLevel = parseResult.confidence > 0.8 ? "high" : 
                             parseResult.confidence > 0.6 ? "good" : "moderate";
      
      let message = `Logged "${voiceText}" as ${intentLabels[parseResult.intent]}`;
      
      if (parseResult.duration) {
        message += ` (${parseResult.duration})`;
      }
      
      if (parseResult.source === 'fallback') {
        message += " (using keyword matching)";
      }
      
      console.log(`✅ Activity logged successfully: ${parseResult.intent} (confidence: ${parseResult.confidence})`);
      
      return {
        success: true,
        intent: parseResult.intent,
        keywords: parseResult.keywords,
        message,
        confidence: parseResult.confidence,
        source: parseResult.source
      };
    } catch (error) {
      console.error("❌ Error processing MVP voice log:", error);
      
      // Return appropriate error based on error type
      if (error.message === "User not found") {
        return {
          success: false,
          intent: "general_activity_log",
          keywords: [],
          message: "User not found. Please sign in again.",
          confidence: 0
        };
      }
      
      if (error.message.includes("too long")) {
        return {
          success: false,
          intent: "general_activity_log",
          keywords: [],
          message: "Input too long. Please try a shorter description.",
          confidence: 0
        };
      }
      
      return {
        success: false,
        intent: "general_activity_log",
        keywords: [],
        message: "Sorry, I couldn't process that. Please try again or be more specific.",
        confidence: 0
      };
    }
  }

  async getMVPDashboardData(userId: number) {
    console.log(`📊 Getting dashboard data for user ${userId}`);
    
    const user = await mvpStorage.getUser(userId);
    if (!user) {
      console.error(`❌ User ${userId} not found in getMVPDashboardData`);
      throw new Error("User not found");
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);

    const recentActivities = await mvpStorage.getMvpActivityLogs(userId, 10);
    console.log(`📋 Retrieved ${recentActivities.length} recent activities`);

    // Calculate today's activities
    const today = new Date().toDateString();
    const todayActivities = recentActivities.filter(activity => 
      activity.timestamp && new Date(activity.timestamp).toDateString() === today
    );

    // Calculate activity breakdown by intent
    const activityBreakdown = recentActivities.reduce((acc, activity) => {
      acc[activity.detectedIntent] = (acc[activity.detectedIntent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dashboardData = {
      user,
      recentActivities,
      totalActivities: recentActivities.length,
      todayActivities: todayActivities.length,
      activityBreakdown
    };

    console.log(`✅ Dashboard data compiled: ${dashboardData.totalActivities} total, ${dashboardData.todayActivities} today`);
    
    return dashboardData;
  }

  async getAIStatus(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy', details: string }> {
    try {
      return await geminiMVPService.healthCheck();
    } catch (error) {
      return {
        status: 'unhealthy',
        details: `AI service error: ${error.message}`
      };
    }
  }

  // Get activity statistics
  async getActivityStats(userId: number, days: number = 7) {
    const activities = await mvpStorage.getMvpActivityLogs(userId, 100);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentActivities = activities.filter(activity => 
      activity.timestamp && new Date(activity.timestamp) >= cutoffDate
    );

    const stats = {
      total: recentActivities.length,
      byIntent: {} as Record<MVPIntentType, number>,
      byDay: {} as Record<string, number>,
      averageConfidence: 0
    };

    let totalConfidence = 0;
    
    recentActivities.forEach(activity => {
      // Count by intent
      stats.byIntent[activity.detectedIntent] = (stats.byIntent[activity.detectedIntent] || 0) + 1;
      
      // Count by day
      const day = activity.timestamp?.toDateString() || 'Unknown';
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
      
      // Calculate confidence (if available in keywords)
      const confidence = activity.extractedKeywords?.confidence || 0.7;
      totalConfidence += confidence;
    });

    stats.averageConfidence = recentActivities.length > 0 ? totalConfidence / recentActivities.length : 0;

    return stats;
  }
}

export const mvpWellnessService = new MVPWellnessService();