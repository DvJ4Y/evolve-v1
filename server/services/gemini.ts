import { GoogleGenAI } from "@google/genai";
import { storage } from "../storage";
import { type PillarType } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "" });

export interface ParsedWellnessActivity {
  pillar: PillarType;
  type: string;
  details: any;
  duration?: number;
}

export interface WellnessParseResult {
  activities: ParsedWellnessActivity[];
  summary: string;
}

export class GeminiService {
  async parseWellnessActivities(voiceText: string, userId: number): Promise<WellnessParseResult> {
    try {
      // Get user context for supplement cross-referencing
      const user = await storage.getUser(userId);
      const userSupplements = user?.supplements?.map(s => s.name).join(", ") || "";

      const systemPrompt = `You are an AI wellness companion that parses voice logs into structured wellness activities.

CONTEXT:
- User's supplements: ${userSupplements}
- Wellness pillars: BODY (physical health, exercise, nutrition), MIND (mental wellness, meditation, focus), SOUL (spiritual growth, gratitude, reflection)

TASK: Parse the voice input and extract wellness activities. Each activity should be categorized into one of the three pillars.

ACTIVITY TYPES:
BODY: workout, cardio, strength_training, yoga, nutrition, supplement, meal, hydration, sleep
MIND: meditation, breathing, focus_session, mindfulness, stress_relief, learning, reading
SOUL: gratitude, reflection, journaling, prayer, nature_connection, acts_of_kindness, purpose_work

For supplements mentioned, cross-reference with the user's supplement list. For workouts, extract exercises, sets, reps, weights if mentioned.

Respond with JSON in this exact format:
{
  "activities": [
    {
      "pillar": "BODY" | "MIND" | "SOUL",
      "type": "activity_type",
      "details": {
        "description": "string",
        "exercises": [{"name": "string", "sets": number, "reps": number, "weight": number}], // for workouts
        "supplements": ["supplement_names"], // for supplement taking
        "calories": number, // if mentioned
        "mood": 1-10, // if mentioned
        "energy": 1-10, // if mentioned
        "gratitude": ["item1", "item2"], // for gratitude
        "reflection": "string", // for reflection
        "notes": "string"
      },
      "duration": number // in minutes, if mentioned or can be inferred
    }
  ],
  "summary": "Brief summary of what was logged"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              activities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    pillar: { type: "string", enum: ["BODY", "MIND", "SOUL"] },
                    type: { type: "string" },
                    details: { type: "object" },
                    duration: { type: "number" }
                  },
                  required: ["pillar", "type", "details"]
                }
              },
              summary: { type: "string" }
            },
            required: ["activities", "summary"]
          }
        },
        contents: voiceText,
      });

      const rawJson = response.text;
      if (rawJson) {
        return JSON.parse(rawJson);
      } else {
        throw new Error("Empty response from model");
      }
    } catch (error) {
      console.error("Failed to parse wellness activities:", error);
      throw new Error(`Failed to parse wellness activities: ${error}`);
    }
  }

  async generateWellnessInsights(userId: number): Promise<string> {
    try {
      const recentActivities = await storage.getActivityLogs(userId, 30);
      const user = await storage.getUser(userId);
      
      // Get last 7 days stats
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      });
      
      const weeklyStats = await Promise.all(
        dates.map(date => storage.getDailyStats(userId, date))
      );

      const systemPrompt = `You are a holistic wellness coach. Analyze the user's wellness data and provide personalized insights and recommendations.

USER DATA:
- Name: ${user?.name}
- Goals: ${JSON.stringify(user?.goals)}
- Recent activities: ${JSON.stringify(recentActivities.slice(0, 10))}
- Weekly progress: ${JSON.stringify(weeklyStats)}

Provide encouraging, actionable insights focusing on:
1. Progress patterns across Body, Mind, Soul pillars
2. Areas of strength and improvement opportunities  
3. Specific recommendations for tomorrow
4. Motivational message

Keep it concise, positive, and personalized. Use the user's name.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemPrompt,
      });

      return response.text || "Keep up the great work on your wellness journey!";
    } catch (error) {
      console.error("Failed to generate insights:", error);
      return "Your wellness journey is unique and valuable. Keep focusing on small, consistent progress!";
    }
  }

  async parseOnboardingGoals(goalsText: string): Promise<{ body: string[], mind: string[], soul: string[] }> {
    try {
      const systemPrompt = `Parse the user's wellness goals and categorize them into three pillars:

BODY: Physical health, fitness, nutrition, exercise goals
MIND: Mental wellness, stress management, focus, learning goals  
SOUL: Spiritual growth, purpose, gratitude, connection goals

Input: "${goalsText}"

Respond with JSON:
{
  "body": ["goal1", "goal2"],
  "mind": ["goal1", "goal2"], 
  "soul": ["goal1", "goal2"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              body: { type: "array", items: { type: "string" } },
              mind: { type: "array", items: { type: "string" } },
              soul: { type: "array", items: { type: "string" } }
            },
            required: ["body", "mind", "soul"]
          }
        },
        contents: systemPrompt,
      });

      const rawJson = response.text;
      if (rawJson) {
        return JSON.parse(rawJson);
      } else {
        throw new Error("Empty response from model");
      }
    } catch (error) {
      console.error("Failed to parse goals:", error);
      // Return default structure on error
      return {
        body: ["Maintain physical health"],
        mind: ["Reduce stress and improve focus"],
        soul: ["Practice gratitude and find purpose"]
      };
    }
  }
}

export const geminiService = new GeminiService();
