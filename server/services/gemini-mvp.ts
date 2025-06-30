import { GoogleGenAI } from "@google/genai";
import { type MVPIntentType } from "@shared/schema";

// Initialize with proper error handling
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("GEMINI_API_KEY not configured - using fallback classification");
}

export interface MVPParseResult {
  intent: MVPIntentType;
  keywords: string[];
  duration?: string;
  intensity?: string;
  quantity?: string;
  confidence: number;
}

export class GeminiMVPService {
  private fallbackClassification(text: string): MVPParseResult {
    const lowerText = text.toLowerCase();
    let intent: MVPIntentType = "general_activity_log";
    const keywords: string[] = [];
    
    // Simple keyword-based classification
    if (lowerText.includes("workout") || lowerText.includes("exercise") || 
        lowerText.includes("run") || lowerText.includes("gym") || 
        lowerText.includes("training") || lowerText.includes("yoga")) {
      intent = "workout";
      keywords.push("exercise");
    } else if (lowerText.includes("ate") || lowerText.includes("food") || 
               lowerText.includes("lunch") || lowerText.includes("dinner") || 
               lowerText.includes("breakfast") || lowerText.includes("meal")) {
      intent = "food_intake";
      keywords.push("food");
    } else if (lowerText.includes("vitamin") || lowerText.includes("supplement") || 
               lowerText.includes("pill") || lowerText.includes("took")) {
      intent = "supplement_intake";
      keywords.push("supplement");
    } else if (lowerText.includes("meditat") || lowerText.includes("breathing") || 
               lowerText.includes("mindful") || lowerText.includes("relax")) {
      intent = "meditation";
      keywords.push("meditation");
    }
    
    // Extract basic keywords
    const words = text.split(' ').filter(word => word.length > 2);
    keywords.push(...words.slice(0, 3));
    
    // Extract duration if mentioned
    const durationMatch = text.match(/(\d+)\s*(minute|hour|min|hr)/i);
    const duration = durationMatch ? `${durationMatch[1]} ${durationMatch[2]}` : undefined;
    
    return {
      intent,
      keywords: keywords.slice(0, 5),
      duration,
      confidence: 0.7 // Reasonable confidence for keyword matching
    };
  }

  async parseActivityIntent(voiceText: string, userGoal?: string): Promise<MVPParseResult> {
    // If no API key, use fallback immediately
    if (!ai) {
      console.log("Using fallback classification for:", voiceText);
      return this.fallbackClassification(voiceText);
    }

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
      console.error("Gemini API error, using fallback:", error);
      return this.fallbackClassification(voiceText);
    }
  }
}

export const geminiMVPService = new GeminiMVPService();