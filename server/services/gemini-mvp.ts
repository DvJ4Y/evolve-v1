import { GoogleGenAI } from "@google/genai";
import { type MVPIntentType } from "@shared/schema";

// Initialize with proper error handling and validation
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
let apiKeyValidated = false;

// Validate API key format
function validateApiKey(key: string): boolean {
  return key && key.length > 20 && key.startsWith('AI');
}

if (apiKey && validateApiKey(apiKey)) {
  try {
    ai = new GoogleGenAI({ apiKey });
    apiKeyValidated = true;
    console.log("✅ Gemini AI initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Gemini AI:", error);
  }
} else {
  console.warn("⚠️  GEMINI_API_KEY not configured or invalid - using fallback classification");
}

export interface MVPParseResult {
  intent: MVPIntentType;
  keywords: string[];
  duration?: string;
  intensity?: string;
  quantity?: string;
  confidence: number;
  source: 'ai' | 'fallback';
}

export class GeminiMVPService {
  private fallbackClassification(text: string): MVPParseResult {
    const lowerText = text.toLowerCase();
    let intent: MVPIntentType = "general_activity_log";
    const keywords: string[] = [];
    let confidence = 0.6;
    
    // Enhanced keyword-based classification
    const workoutKeywords = ['workout', 'exercise', 'run', 'gym', 'training', 'yoga', 'fitness', 'cardio', 'strength', 'weights', 'swim', 'bike', 'walk', 'jog', 'pilates', 'crossfit', 'hiit'];
    const foodKeywords = ['ate', 'food', 'lunch', 'dinner', 'breakfast', 'meal', 'snack', 'drink', 'protein', 'salad', 'chicken', 'fish', 'vegetables', 'fruit'];
    const supplementKeywords = ['vitamin', 'supplement', 'pill', 'took', 'capsule', 'tablet', 'omega', 'magnesium', 'calcium', 'probiotic'];
    const meditationKeywords = ['meditat', 'breathing', 'mindful', 'relax', 'calm', 'zen', 'peace', 'stress', 'anxiety'];

    // Check for workout activities
    if (workoutKeywords.some(keyword => lowerText.includes(keyword))) {
      intent = "workout";
      keywords.push("exercise");
      confidence = 0.8;
    } 
    // Check for food activities
    else if (foodKeywords.some(keyword => lowerText.includes(keyword))) {
      intent = "food_intake";
      keywords.push("food");
      confidence = 0.8;
    } 
    // Check for supplement activities
    else if (supplementKeywords.some(keyword => lowerText.includes(keyword))) {
      intent = "supplement_intake";
      keywords.push("supplement");
      confidence = 0.8;
    } 
    // Check for meditation activities
    else if (meditationKeywords.some(keyword => lowerText.includes(keyword))) {
      intent = "meditation";
      keywords.push("meditation");
      confidence = 0.8;
    }
    
    // Extract additional keywords
    const words = text.split(' ')
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'for', 'with', 'did', 'had', 'was'].includes(word.toLowerCase()));
    keywords.push(...words.slice(0, 3));
    
    // Extract duration if mentioned
    const durationMatch = text.match(/(\d+)\s*(minute|hour|min|hr|mins|hours)/i);
    const duration = durationMatch ? `${durationMatch[1]} ${durationMatch[2]}` : undefined;
    
    // Extract intensity
    const intensityMatch = text.match(/(light|easy|moderate|hard|intense|heavy|difficult)/i);
    const intensity = intensityMatch ? intensityMatch[1] : undefined;
    
    // Extract quantity
    const quantityMatch = text.match(/(\d+)\s*(reps|sets|times|cups|glasses|servings)/i);
    const quantity = quantityMatch ? `${quantityMatch[1]} ${quantityMatch[2]}` : undefined;
    
    return {
      intent,
      keywords: [...new Set(keywords)].slice(0, 5), // Remove duplicates and limit
      duration,
      intensity,
      quantity,
      confidence,
      source: 'fallback'
    };
  }

  async parseActivityIntent(voiceText: string, userGoal?: string): Promise<MVPParseResult> {
    // If no API key or validation failed, use fallback immediately
    if (!ai || !apiKeyValidated) {
      console.log("🔄 Using fallback classification for:", voiceText.substring(0, 50) + "...");
      return this.fallbackClassification(voiceText);
    }

    try {
      const systemPrompt = `You are an AI wellness assistant that classifies user activity logs into simple categories.

INTENT CATEGORIES:
- workout: Physical exercise, fitness activities, sports, movement
- food_intake: Eating, drinking, meals, snacks, nutrition
- supplement_intake: Taking vitamins, supplements, medications, pills
- meditation: Meditation, mindfulness, breathing exercises, relaxation
- general_activity_log: Any other wellness-related activity${userGoal ? `, especially related to: "${userGoal}"` : ''}

TASK: Classify the user input and extract basic keywords and details.

User input: "${voiceText}"

Respond with JSON in this exact format:
{
  "intent": "workout" | "food_intake" | "supplement_intake" | "meditation" | "general_activity_log",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "duration": "optional duration mentioned (e.g., '30 minutes')",
  "intensity": "optional intensity mentioned (e.g., 'moderate', 'intense')", 
  "quantity": "optional quantity mentioned (e.g., '3 sets', '2 cups')",
  "confidence": 0.0-1.0
}

Extract 3-5 relevant keywords. Include duration, intensity, or quantity only if explicitly mentioned.`;

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API timeout')), 10000)
      );

      const apiPromise = ai.models.generateContent({
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

      const response = await Promise.race([apiPromise, timeoutPromise]);
      const rawJson = response.text;
      
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        console.log("✅ Gemini AI classification successful");
        return {
          intent: parsed.intent,
          keywords: parsed.keywords || [],
          duration: parsed.duration,
          intensity: parsed.intensity,
          quantity: parsed.quantity,
          confidence: parsed.confidence || 0.8,
          source: 'ai'
        };
      } else {
        throw new Error("Empty response from Gemini API");
      }
    } catch (error) {
      console.error("❌ Gemini API error, using fallback:", error.message);
      return this.fallbackClassification(voiceText);
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy', details: string }> {
    if (!ai || !apiKeyValidated) {
      return { 
        status: 'degraded', 
        details: 'Gemini API not configured, using fallback classification' 
      };
    }

    try {
      const testResult = await this.parseActivityIntent("I did a quick test workout");
      return { 
        status: 'healthy', 
        details: `Gemini API working, confidence: ${testResult.confidence}` 
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        details: `Gemini API error: ${error.message}` 
      };
    }
  }
}

export const geminiMVPService = new GeminiMVPService();