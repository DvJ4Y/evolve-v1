import { storage } from "../storage";
import { geminiService } from "./gemini";
import { type PillarType, type InsertActivityLog } from "@shared/schema";

export interface VoiceLogResult {
  success: boolean;
  activities: Array<{
    pillar: PillarType;
    type: string;
    details: any;
    duration?: number;
  }>;
  message: string;
}

export class WellnessService {
  async processVoiceLog(userId: number, voiceText: string): Promise<VoiceLogResult> {
    try {
      // Use Gemini to parse the voice input
      const parsedActivities = await geminiService.parseWellnessActivities(voiceText, userId);
      
      const loggedActivities = [];
      
      // Log each parsed activity
      for (const activity of parsedActivities.activities) {
        const activityLog: InsertActivityLog = {
          userId,
          pillarType: activity.pillar,
          activityType: activity.type,
          details: activity.details,
          durationMinutes: activity.duration,
        };
        
        const logged = await storage.createActivityLog(activityLog);
        loggedActivities.push(activity);
      }
      
      // Update daily stats
      await this.updateDailyStats(userId);
      
      return {
        success: true,
        activities: loggedActivities,
        message: parsedActivities.summary || `Successfully logged ${loggedActivities.length} activities!`
      };
    } catch (error) {
      console.error("Error processing voice log:", error);
      return {
        success: false,
        activities: [],
        message: "Sorry, I couldn't process that. Please try again."
      };
    }
  }

  async updateDailyStats(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = await storage.getActivityLogsByDate(userId, today);
    
    // Calculate pillar progress (0-100)
    const bodyActivities = todayActivities.filter(a => a.pillarType === 'BODY');
    const mindActivities = todayActivities.filter(a => a.pillarType === 'MIND');
    const soulActivities = todayActivities.filter(a => a.pillarType === 'SOUL');
    
    // Simple progress calculation based on activity count and duration
    const bodyProgress = Math.min(100, (bodyActivities.length * 25) + 
      (bodyActivities.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / 60 * 10));
    const mindProgress = Math.min(100, (mindActivities.length * 30) + 
      (mindActivities.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / 30 * 10));
    const soulProgress = Math.min(100, (soulActivities.length * 35) + 
      (soulActivities.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / 20 * 10));
    
    // Calculate detailed stats
    const stats = {
      workouts: bodyActivities.filter(a => a.activityType.includes('workout')).length,
      calories: bodyActivities.reduce((sum, a) => sum + (a.details?.calories || 0), 0),
      meditation: mindActivities.reduce((sum, a) => sum + (a.durationMinutes || 0), 0),
      focusTime: mindActivities.filter(a => a.activityType.includes('focus')).reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / 60,
      gratitude: soulActivities.filter(a => a.activityType.includes('gratitude')).length,
      reflection: soulActivities.reduce((sum, a) => sum + (a.durationMinutes || 0), 0),
    };
    
    await storage.upsertDailyStats({
      userId,
      date: today,
      bodyProgress: Math.round(bodyProgress),
      mindProgress: Math.round(mindProgress),
      soulProgress: Math.round(soulProgress),
      totalActivities: todayActivities.length,
      stats,
    });
  }

  async getDashboardData(userId: number) {
    const user = await storage.getUser(userId);
    if (!user) throw new Error("User not found");

    const today = new Date().toISOString().split('T')[0];
    const dailyStats = await storage.getDailyStats(userId, today);
    const recentActivities = await storage.getActivityLogs(userId, 10);
    const goals = await storage.getGoals(userId);

    return {
      user,
      dailyStats,
      recentActivities,
      goals,
    };
  }

  async getPillarData(userId: number, pillar: PillarType) {
    const activities = await storage.getActivityLogsByPillar(userId, pillar);
    const goals = await storage.getGoalsByPillar(userId, pillar);
    
    // Get last 7 days of stats for trend
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    const weeklyStats = await Promise.all(
      dates.map(date => storage.getDailyStats(userId, date))
    );

    return {
      activities: activities.slice(0, 20), // Last 20 activities
      goals,
      weeklyProgress: weeklyStats.map((stats, index) => ({
        date: dates[index],
        progress: pillar === 'BODY' ? stats?.bodyProgress : 
                 pillar === 'MIND' ? stats?.mindProgress : 
                 stats?.soulProgress || 0
      }))
    };
  }
}

export const wellnessService = new WellnessService();
