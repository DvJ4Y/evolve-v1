import { users, activityLogs, dailyStats, goals, type User, type InsertUser, type ActivityLog, type InsertActivityLog, type DailyStats, type InsertDailyStats, type Goal, type InsertGoal, type PillarType } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Activity operations
  createActivityLog(activity: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(userId: number, limit?: number): Promise<ActivityLog[]>;
  getActivityLogsByPillar(userId: number, pillar: PillarType): Promise<ActivityLog[]>;
  getActivityLogsByDate(userId: number, date: string): Promise<ActivityLog[]>;

  // Daily stats operations
  getDailyStats(userId: number, date: string): Promise<DailyStats | undefined>;
  upsertDailyStats(stats: InsertDailyStats): Promise<DailyStats>;
  getDailyStatsRange(userId: number, startDate: string, endDate: string): Promise<DailyStats[]>;

  // Goals operations
  createGoal(goal: InsertGoal): Promise<Goal>;
  getGoals(userId: number): Promise<Goal[]>;
  getGoalsByPillar(userId: number, pillar: PillarType): Promise<Goal[]>;
  updateGoal(id: number, updates: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private activityLogs: Map<number, ActivityLog>;
  private dailyStats: Map<string, DailyStats>; // key: userId-date
  private goals: Map<number, Goal>;
  private currentUserId: number;
  private currentActivityId: number;
  private currentStatsId: number;
  private currentGoalId: number;

  constructor() {
    this.users = new Map();
    this.activityLogs = new Map();
    this.dailyStats = new Map();
    this.goals = new Map();
    this.currentUserId = 1;
    this.currentActivityId = 1;
    this.currentStatsId = 1;
    this.currentGoalId = 1;

    // Create a demo user
    this.createDemoUser();
  }

  private async createDemoUser() {
    const demoUser: InsertUser = {
      name: "Alex",
      email: "alex@evolveai.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      age: 28,
      weight: "75.5",
      height: "175.0",
      goals: {
        body: ["Run 3 times a week", "Maintain healthy weight", "Build strength"],
        mind: ["Meditate daily", "Reduce stress", "Improve focus"],
        soul: ["Practice gratitude", "Connect with nature", "Find purpose"]
      },
      supplements: [
        {
          id: "1",
          name: "Vitamin D3",
          dosage: "1000 IU",
          frequency: "Daily"
        },
        {
          id: "2",
          name: "Omega-3",
          dosage: "1000mg",
          frequency: "Daily"
        },
        {
          id: "3",
          name: "Magnesium",
          dosage: "400mg",
          frequency: "Evening"
        }
      ]
    };

    const user = await this.createUser(demoUser);
    
    // Create today's stats
    const today = new Date().toISOString().split('T')[0];
    await this.upsertDailyStats({
      userId: user.id,
      date: today,
      bodyProgress: 70,
      mindProgress: 45,
      soulProgress: 60,
      totalActivities: 6,
      stats: {
        workouts: 3,
        calories: 2150,
        meditation: 15,
        focusTime: 2.5,
        gratitude: 3,
        reflection: 20
      }
    });
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
      goals: insertUser.goals || null,
      supplements: insertUser.supplements || [],
      currentStreak: 7,
      longestStreak: 12,
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

  async createActivityLog(activity: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentActivityId++;
    const activityLog: ActivityLog = {
      id,
      userId: activity.userId,
      pillarType: activity.pillarType,
      activityType: activity.activityType,
      details: activity.details || null,
      durationMinutes: activity.durationMinutes || null,
      completedAt: new Date(),
      createdAt: new Date(),
    };
    this.activityLogs.set(id, activityLog);
    return activityLog;
  }

  async getActivityLogs(userId: number, limit = 50): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getActivityLogsByPillar(userId: number, pillar: PillarType): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => log.userId === userId && log.pillarType === pillar)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getActivityLogsByDate(userId: number, date: string): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => {
        const logDate = log.createdAt.toISOString().split('T')[0];
        return log.userId === userId && logDate === date;
      });
  }

  async getDailyStats(userId: number, date: string): Promise<DailyStats | undefined> {
    const key = `${userId}-${date}`;
    return this.dailyStats.get(key);
  }

  async upsertDailyStats(stats: InsertDailyStats): Promise<DailyStats> {
    const key = `${stats.userId}-${stats.date}`;
    const existing = this.dailyStats.get(key);

    if (existing) {
      const updated = { ...existing, ...stats, updatedAt: new Date() };
      this.dailyStats.set(key, updated);
      return updated;
    } else {
      const id = this.currentStatsId++;
      const newStats: DailyStats = {
        ...stats,
        id,
        updatedAt: new Date(),
      };
      this.dailyStats.set(key, newStats);
      return newStats;
    }
  }

  async getDailyStatsRange(userId: number, startDate: string, endDate: string): Promise<DailyStats[]> {
    return Array.from(this.dailyStats.values())
      .filter(stats => 
        stats.userId === userId && 
        stats.date >= startDate && 
        stats.date <= endDate
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const id = this.currentGoalId++;
    const newGoal: Goal = {
      ...goal,
      id,
      currentValue: 0,
      createdAt: new Date(),
    };
    this.goals.set(id, newGoal);
    return newGoal;
  }

  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId && goal.isActive);
  }

  async getGoalsByPillar(userId: number, pillar: PillarType): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId && goal.pillarType === pillar && goal.isActive);
  }

  async updateGoal(id: number, updates: Partial<InsertGoal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;

    const updatedGoal = { ...goal, ...updates };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }
}

export const storage = new MemStorage();
