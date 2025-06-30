import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Database connection with proper error handling
let db: ReturnType<typeof drizzle> | null = null;
let connectionAttempted = false;

export function getDatabase() {
  if (!connectionAttempted) {
    connectionAttempted = true;
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.warn("⚠️  DATABASE_URL not configured - using memory storage fallback");
      return null;
    }

    try {
      const sql = neon(databaseUrl);
      db = drizzle(sql, { schema });
      console.log("✅ Database connection established");
    } catch (error) {
      console.error("❌ Failed to connect to database:", error);
      console.log("🔄 Falling back to memory storage");
      return null;
    }
  }
  
  return db;
}

// Test database connection with timeout
export async function testDatabaseConnection(): Promise<boolean> {
  const database = getDatabase();
  if (!database) return false;

  try {
    // Simple query to test connection with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 5000)
    );
    
    const queryPromise = database.select().from(schema.users).limit(1);
    
    await Promise.race([queryPromise, timeoutPromise]);
    console.log("✅ Database connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    return false;
  }
}

export { db };