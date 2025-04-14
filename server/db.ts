import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Create a PostgreSQL client with the connection string from environment variables
// Using postgres-js instead of @neondatabase/serverless to avoid WebSocket issues
let client: any;

// Only attempt to connect if the DATABASE_URL is defined
if (process.env.DATABASE_URL) {
  try {
    // Create a postgres client for the database
    client = postgres(process.env.DATABASE_URL, { max: 10 });
    console.log("Database connection initialized");
  } catch (error) {
    console.error("Error initializing database connection:", error);
    // Fallback to a dummy client that will throw on usage
    client = {
      query: () => { throw new Error("Database connection failed"); }
    };
  }
} else {
  console.warn("DATABASE_URL not defined, using fallback client");
  // Use a dummy client that will throw on usage
  client = {
    query: () => { throw new Error("Database connection not configured - DATABASE_URL missing"); }
  };
}

// Create a database instance with the schema
export const db = drizzle(client, { schema });