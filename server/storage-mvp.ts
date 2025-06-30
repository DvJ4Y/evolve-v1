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

export const mvpStorage = new MVPMemStorage();