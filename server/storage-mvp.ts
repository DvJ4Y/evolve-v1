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
        const result = await db.select().from(users).where(eq(users.id, id.toString())).limit(1);
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
        const userWithId = {
          ...insertUser,
          id: Date.now().toString() // Generate string ID for database
        };
        const result = await db.insert(users).values(userWithId).returning();
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
        const result = await db.update(users).set(updates).where(eq(users.id, id.toString())).returning();
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
        const activityWithStringUserId = {
          ...activity,
          userId: activity.userId.toString()
        };
        const result = await db.insert(mvpActivityLogs).values(activityWithStringUserId).returning();
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
          .where(eq(mvpActivityLogs.userId, userId.toString()))
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
    // Create multiple demo users to handle different user IDs
    const demoUsers = [
      {
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
      },
      {
        name: "Sarah Chen",
        email: "sarah@evolveai.com", 
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        age: 32,
        primaryWellnessGoal: "I want to build strength and improve my mental clarity through fitness and mindfulness",
        goals: {
          body: ["Strength training 4x per week", "Improve flexibility"],
          mind: ["Daily meditation", "Read more books"],
          soul: ["Practice mindfulness", "Volunteer regularly"]
        }
      },
      {
        name: "Mike Rodriguez",
        email: "mike@evolveai.com",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        age: 25,
        primaryWellnessGoal: "I want to maintain work-life balance and stay physically active",
        goals: {
          body: ["Run 3 times a week", "Eat healthier meals"],
          mind: ["Reduce screen time", "Practice deep breathing"],
          soul: ["Spend time in nature", "Connect with friends"]
        }
      }
    ];

    for (const userData of demoUsers) {
      const user = await this.createUser(userData);
      
      // Create sample activities for each user
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
    }

    console.log(`✅ Demo data created successfully for ${demoUsers.length} users`);
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded', details: string }> {
    return { 
      status: 'degraded', 
      details: `Memory storage active with ${this.users.size} users and ${this.mvpActivityLogs.size} activities` 
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      console.warn(`⚠️  User ${id} not found in memory storage. Available users: ${Array.from(this.users.keys()).join(', ')}`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id: id.toString(), // Convert to string to match schema
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
    console.log(`✅ Created user ${id}: ${user.name} (${user.email})`);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      console.warn(`⚠️  Cannot update user ${id} - not found`);
      return undefined;
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      id: user.id,
      createdAt: user.createdAt,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    };
    this.users.set(id, updatedUser);
    console.log(`✅ Updated user ${id}: ${updatedUser.name}`);
    return updatedUser;
  }

  async createMvpActivityLog(activity: InsertMvpActivityLog): Promise<MvpActivityLog> {
    const id = this.currentActivityId++;
    const activityLog: MvpActivityLog = {
      id,
      userId: activity.userId.toString(), // Ensure string type
      rawTextInput: activity.rawTextInput,
      detectedIntent: activity.detectedIntent,
      extractedKeywords: activity.extractedKeywords || null,
      timestamp: new Date(),
      createdAt: new Date(),
    };
    this.mvpActivityLogs.set(id, activityLog);
    console.log(`✅ Created activity ${id} for user ${activity.userId}: ${activity.detectedIntent}`);
    return activityLog;
  }

  async getMvpActivityLogs(userId: number, limit = 50): Promise<MvpActivityLog[]> {
    const activities = Array.from(this.mvpActivityLogs.values())
      .filter(log => parseInt(log.userId) === userId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
    
    console.log(`📋 Retrieved ${activities.length} activities for user ${userId}`);
    return activities;
  }
}

// Use database storage with memory fallback
export const mvpStorage = new MVPDatabaseStorage();