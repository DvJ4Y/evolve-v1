import { getDatabase } from "./db";
import { eq, desc } from "drizzle-orm";
import { mvpActivityLogs, users, type User, type InsertUser, type MvpActivityLog, type InsertMvpActivityLog } from "@shared/schema";

export interface IMVPStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // MVP Activity operations
  createMvpActivityLog(activity: InsertMvpActivityLog): Promise<MvpActivityLog>;
  getMvpActivityLogs(userId: number, limit?: number): Promise<MvpActivityLog[]>;
  
  // Health check
  healthCheck(): Promise<{ status: 'healthy' | 'degraded', details: string }>;
}

// Database storage implementation with memory fallback
export class MVPDatabaseStorage implements IMVPStorage {
  private memStorage = new MVPMemStorage();

  private async withFallback<T>(
    operation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const db = getDatabase();
    
    if (!db) {
      console.log(`🔄 Database not available for ${operationName}, using memory storage`);
      return fallbackOperation();
    }

    try {
      const result = await operation();
      return result;
    } catch (error) {
      console.error(`❌ Database error in ${operationName}, falling back to memory:`, error);
      return fallbackOperation();
    }
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded', details: string }> {
    const db = getDatabase();
    if (!db) {
      return { status: 'degraded', details: 'Database not available, using memory storage' };
    }

    try {
      await db.select().from(users).limit(1);
      return { status: 'healthy', details: 'Database connection working' };
    } catch (error) {
      return { status: 'degraded', details: `Database error: ${error.message}` };
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.withFallback(
      async () => {
        const db = getDatabase()!;
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return result[0];
      },
      () => this.memStorage.getUser(id),
      'getUser'
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.withFallback(
      async () => {
        const db = getDatabase()!;
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0];
      },
      () => this.memStorage.getUserByEmail(email),
      'getUserByEmail'
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return this.withFallback(
      async () => {
        const db = getDatabase()!;
        const result = await db.insert(users).values(insertUser).returning();
        return result[0];
      },
      () => this.memStorage.createUser(insertUser),
      'createUser'
    );
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    return this.withFallback(
      async () => {
        const db = getDatabase()!;
        const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
        return result[0];
      },
      () => this.memStorage.updateUser(id, updates),
      'updateUser'
    );
  }

  async createMvpActivityLog(activity: InsertMvpActivityLog): Promise<MvpActivityLog> {
    return this.withFallback(
      async () => {
        const db = getDatabase()!;
        const result = await db.insert(mvpActivityLogs).values(activity).returning();
        return result[0];
      },
      () => this.memStorage.createMvpActivityLog(activity),
      'createMvpActivityLog'
    );
  }

  async getMvpActivityLogs(userId: number, limit = 50): Promise<MvpActivityLog[]> {
    return this.withFallback(
      async () => {
        const db = getDatabase()!;
        const result = await db
          .select()
          .from(mvpActivityLogs)
          .where(eq(mvpActivityLogs.userId, userId))
          .orderBy(desc(mvpActivityLogs.timestamp))
          .limit(limit);
        return result;
      },
      () => this.memStorage.getMvpActivityLogs(userId, limit),
      'getMvpActivityLogs'
    );
  }
}

// Enhanced memory storage implementation (fallback)
export class MVPMemStorage implements IMVPStorage {
  private users: Map<number, User>;
  private mvpActivityLogs: Map<number, MvpActivityLog>;
  private currentUserId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.mvpActivityLogs = new Map();
    this.currentUserId = 1;
    this.currentActivityId = 1;

    // Create demo users for MVP
    this.createDemoData();
  }

  private async createDemoData() {
    // Create primary demo user
    const demoUser: InsertUser = {
      name: "Alex Johnson",
      email: "alex@evolveai.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      age: 28,
      primaryWellnessGoal: "I want to stay healthy and reduce stress through regular exercise and meditation",
      goals: {
        body: ["Exercise 3 times a week", "Maintain healthy weight"],
        mind: ["Meditate daily", "Reduce work stress"],
        soul: ["Practice gratitude", "Connect with nature"]
      }
    };

    const user = await this.createUser(demoUser);
    
    // Create some sample activities for demo
    const sampleActivities = [
      {
        userId: user.id,
        rawTextInput: "I did a 30 minute HIIT workout this morning",
        detectedIntent: "workout" as const,
        extractedKeywords: {
          keywords: ["HIIT", "workout", "morning"],
          duration: "30 minutes",
          intensity: "high"
        }
      },
      {
        userId: user.id,
        rawTextInput: "Had a healthy chicken salad for lunch",
        detectedIntent: "food_intake" as const,
        extractedKeywords: {
          keywords: ["chicken", "salad", "lunch"],
          quantity: "1 serving"
        }
      },
      {
        userId: user.id,
        rawTextInput: "Took my daily vitamin D supplement",
        detectedIntent: "supplement_intake" as const,
        extractedKeywords: {
          keywords: ["vitamin", "D", "supplement"],
          quantity: "1 capsule"
        }
      },
      {
        userId: user.id,
        rawTextInput: "Meditated for 15 minutes before work",
        detectedIntent: "meditation" as const,
        extractedKeywords: {
          keywords: ["meditated", "work", "morning"],
          duration: "15 minutes"
        }
      }
    ];

    for (const activity of sampleActivities) {
      await this.createMvpActivityLog(activity);
    }

    console.log("✅ Demo data created successfully");
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded', details: string }> {
    return { 
      status: 'degraded', 
      details: `Memory storage active with ${this.users.size} users and ${this.mvpActivityLogs.size} activities` 
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      name: insertUser.name,
      email: insertUser.email,
      avatar: insertUser.avatar || null,
      age: insertUser.age || null,
      weight: insertUser.weight || null,
      height: insertUser.height || null,
      primaryWellnessGoal: insertUser.primaryWellnessGoal || null,
      goals: insertUser.goals || null,
      supplements: insertUser.supplements || [],
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...updates,
      id: user.id,
      createdAt: user.createdAt,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createMvpActivityLog(activity: InsertMvpActivityLog): Promise<MvpActivityLog> {
    const id = this.currentActivityId++;
    const activityLog: MvpActivityLog = {
      id,
      userId: activity.userId,
      rawTextInput: activity.rawTextInput,
      detectedIntent: activity.detectedIntent,
      extractedKeywords: activity.extractedKeywords || null,
      timestamp: new Date(),
      createdAt: new Date(),
    };
    this.mvpActivityLogs.set(id, activityLog);
    return activityLog;
  }

  async getMvpActivityLogs(userId: number, limit = 50): Promise<MvpActivityLog[]> {
    return Array.from(this.mvpActivityLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }
}

// Use database storage with memory fallback
export const mvpStorage = new MVPDatabaseStorage();