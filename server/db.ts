import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Database connection with proper error handling
let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!db) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.warn("DATABASE_URL not configured - database operations will fail");
      return null;
    }

    try {
      const sql = neon(databaseUrl);
      db = drizzle(sql, { schema });
      console.log("Database connection established");
    } catch (error) {
      console.error("Failed to connect to database:", error);
      return null;
    }
  }
  
  return db;
}

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  const database = getDatabase();
  if (!database) return false;

  try {
    // Simple query to test connection
    await database.select().from(schema.users).limit(1);
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

export { db };