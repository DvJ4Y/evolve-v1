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
      console.log(`Database not available for ${operationName}, using memory storage`);
      return fallbackOperation();
    }

    try {
      return await operation();
    } catch (error) {
      console.error(`Database error in ${operationName}, falling back to memory:`, error);
      return fallbackOperation();
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

// Memory storage implementation (fallback)
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

    // Create a demo user for MVP
    this.createDemoUser();
  }

  private async createDemoUser() {
    const demoUser: InsertUser = {
      name: "Alex",
      email: "alex@evolveai.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      age: 28,
      primaryWellnessGoal: "Stay healthy and reduce stress through regular exercise and meditation",
      goals: {
        body: ["Run 3 times a week", "Maintain healthy weight"],
        mind: ["Meditate daily", "Reduce stress"],
        soul: ["Practice gratitude", "Connect with nature"]
      }
    };

    await this.createUser(demoUser);
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