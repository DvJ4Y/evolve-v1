import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  age: integer("age"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  height: decimal("height", { precision: 5, scale: 2 }),
  primaryWellnessGoal: text("primary_wellness_goal"),
  goals: jsonb("goals").$type<{
    body: string[];
    mind: string[];
    soul: string[];
  }>(),
  supplements: jsonb("supplements").$type<Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    imageUrl?: string;
  }>>().default([]),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// MVP Activity Logs - Simplified for quick launch
export const mvpActivityLogs = pgTable("mvp_activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rawTextInput: text("raw_text_input").notNull(),
  detectedIntent: text("detected_intent", { 
    enum: ["workout", "food_intake", "supplement_intake", "meditation", "general_activity_log"] 
  }).notNull(),
  extractedKeywords: jsonb("extracted_keywords_json").$type<{
    keywords: string[];
    duration?: string;
    intensity?: string;
    quantity?: string;
    [key: string]: any;
  }>(),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  pillarType: text("pillar_type", { enum: ["BODY", "MIND", "SOUL"] }).notNull(),
  activityType: text("activity_type").notNull(),
  details: jsonb("details").$type<{
    duration?: number;
    intensity?: string;
    notes?: string;
    exercises?: Array<{
      name: string;
      sets?: number;
      reps?: number;
      weight?: number;
    }>;
    supplements?: string[];
    calories?: number;
    mood?: number;
    energy?: number;
    gratitude?: string[];
    reflection?: string;
  }>(),
  durationMinutes: integer("duration_minutes"),
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyStats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  bodyProgress: integer("body_progress").default(0), // 0-100
  mindProgress: integer("mind_progress").default(0), // 0-100
  soulProgress: integer("soul_progress").default(0), // 0-100
  totalActivities: integer("total_activities").default(0),
  stats: jsonb("stats").$type<{
    workouts: number;
    calories: number;
    meditation: number;
    focusTime: number;
    gratitude: number;
    reflection: number;
  }>().default({
    workouts: 0,
    calories: 0,
    meditation: 0,
    focusTime: 0,
    gratitude: 0,
    reflection: 0,
  }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  pillarType: text("pillar_type", { enum: ["BODY", "MIND", "SOUL"] }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: integer("target_value"),
  currentValue: integer("current_value").default(0),
  unit: text("unit"), // e.g., "minutes", "times", "kg"
  frequency: text("frequency", { enum: ["DAILY", "WEEKLY", "MONTHLY"] }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  currentStreak: true,
  longestStreak: true,
});

export const insertMvpActivityLogSchema = createInsertSchema(mvpActivityLogs).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertDailyStatsSchema = createInsertSchema(dailyStats).omit({
  id: true,
  updatedAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  currentValue: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type MvpActivityLog = typeof mvpActivityLogs.$inferSelect;
export type InsertMvpActivityLog = z.infer<typeof insertMvpActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type DailyStats = typeof dailyStats.$inferSelect;
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type PillarType = "BODY" | "MIND" | "SOUL";
export type WellnessStats = {
  workouts: number;
  calories: number;
  meditation: number;
  focusTime: number;
  gratitude: number;
  reflection: number;
};

export type MVPIntentType = "workout" | "food_intake" | "supplement_intake" | "meditation" | "general_activity_log";