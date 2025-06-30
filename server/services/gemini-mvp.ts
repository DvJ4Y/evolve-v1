import { GoogleGenAI } from "@google/genai";
import { type MVPIntentType } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "" });

export interface MVPParseResult {
  intent: MVPIntentType;
  keywords: string[];
  duration?: string;
  intensity?: string;
  quantity?: string;
  confidence: number;
}

export class GeminiMVPService {
  async parseActivityIntent(voiceText: string, userGoal?: string): Promise<MVPParseResult> {
    try {
      const systemPrompt = `You are an AI wellness assistant that classifies user activity logs into simple categories.

INTENT CATEGORIES:
- workout: Physical exercise, fitness activities, sports
- food_intake: Eating, drinking, meals, snacks
- supplement_intake: Taking vitamins, supplements, medications
- meditation: Meditation, mindfulness, breathing exercises
- general_activity_log: Any other wellness-related activity${userGoal ? `, especially related to: "${userGoal}"` : ''}

TASK: Classify the user input and extract basic keywords.

User input: "${voiceText}"

Respond with JSON in this exact format:
{
  "intent": "workout" | "food_intake" | "supplement_intake" | "meditation" | "general_activity_log",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "duration": "optional duration mentioned",
  "intensity": "optional intensity mentioned", 
  "quantity": "optional quantity mentioned",
  "confidence": 0.0-1.0
}

Extract 3-5 relevant keywords. Include duration, intensity, or quantity only if explicitly mentioned.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              intent: { 
                type: "string", 
                enum: ["workout", "food_intake", "supplement_intake", "meditation", "general_activity_log"] 
              },
              keywords: { 
                type: "array", 
                items: { type: "string" } 
              },
              duration: { type: "string" },
              intensity: { type: "string" },
              quantity: { type: "string" },
              confidence: { type: "number", minimum: 0, maximum: 1 }
            },
            required: ["intent", "keywords", "confidence"]
          }
        },
        contents: voiceText,
      });

      const rawJson = response.text;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        return {
          intent: parsed.intent,
          keywords: parsed.keywords || [],
          duration: parsed.duration,
          intensity: parsed.intensity,
          quantity: parsed.quantity,
          confidence: parsed.confidence || 0.8
        };
      } else {
        throw new Error("Empty response from model");
      }
    } catch (error) {
      console.error("Failed to parse activity intent:", error);
      // Fallback classification
      return {
        intent: "general_activity_log",
        keywords: voiceText.split(' ').slice(0, 3),
        confidence: 0.3
      };
    }
  }
}

export const geminiMVPService = new GeminiMVPService();