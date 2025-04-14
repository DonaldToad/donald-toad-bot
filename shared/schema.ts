import { pgTable, text, serial, integer, bigint, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  telegramChatId: text("telegram_chat_id"),
  platform: text("platform").default("web").notNull(), // 'web' or 'telegram'
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: integer("user_id"), // Optional reference to user
  platform: text("platform").default("web").notNull(), // 'web' or 'telegram'
});

// New table for learning from user interactions
export const learningData = pgTable("learning_data", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  normalizedQuestion: text("normalized_question").notNull(),
  topic: text("topic"),  // Categorizes the question (recipe, crypto, etc.)
  frequency: integer("frequency").default(1), // How often this has been asked
  keywords: text("keywords").array(),
  lastAskedAt: timestamp("last_asked_at").defaultNow(),
  firstAskedAt: timestamp("first_asked_at").defaultNow(),
  metadata: jsonb("metadata").default({}), // Additional data we might track
});

// New table to track user interests
export const userInterests = pgTable("user_interests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  topic: text("topic").notNull(),
  interestLevel: integer("interest_level").default(1), // 1-10 scale
  firstInteractedAt: timestamp("first_interacted_at").defaultNow(),
  lastInteractedAt: timestamp("last_interacted_at").defaultNow(),
});

// Enhanced user conversation memory for better context tracking
export const conversationMemory = pgTable("conversation_memory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lastTopic: text("last_topic"), // Last topic discussed
  lastJokeTopic: text("last_joke_topic"), // Last joke topic
  lastFactType: text("last_fact_type"), // Last fact type
  lastQueryType: text("last_query_type"), // Last query type
  lastRecipe: text("last_recipe"), // Last recipe discussed
  politicalPreference: text("political_preference"), // Track political preference (if mentioned)
  defiInterest: integer("defi_interest").default(0), // Interest in DeFi topics (0-10)
  numInteractions: integer("num_interactions").default(1), // Count of total interactions
  lastInteractedAt: timestamp("last_interacted_at").defaultNow(),
  metadata: jsonb("metadata").default({}), // Additional user context data
});

// Game state tracking for trivia and guessing games
export const gameState = pgTable("game_state", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gameType: text("game_type").notNull(), // "trivia" or "number_game"
  isActive: boolean("is_active").default(true),
  currentQuestion: text("current_question"), // Current trivia question
  correctAnswer: text("correct_answer"), // Correct answer for trivia
  targetNumber: integer("target_number"), // For number guessing game
  attemptsLeft: integer("attempts_left"), // Remaining attempts
  lastGuess: integer("last_guess"), // Last number guessed
  lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").default({}), // Additional game state data
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  telegramChatId: true,
  platform: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  role: true,
  content: true,
  userId: true,
  platform: true,
});

export const insertLearningDataSchema = createInsertSchema(learningData).pick({
  question: true,
  normalizedQuestion: true,
  topic: true,
  keywords: true,
  metadata: true,
});

export const insertUserInterestSchema = createInsertSchema(userInterests).pick({
  userId: true,
  topic: true,
  interestLevel: true,
});

export const insertConversationMemorySchema = createInsertSchema(conversationMemory).pick({
  userId: true,
  lastTopic: true,
  lastJokeTopic: true,
  lastFactType: true,
  lastQueryType: true,
  lastRecipe: true,
  politicalPreference: true,
  defiInterest: true,
  numInteractions: true,
  metadata: true,
});

export const insertGameStateSchema = createInsertSchema(gameState).pick({
  userId: true,
  gameType: true,
  isActive: true,
  currentQuestion: true,
  correctAnswer: true,
  targetNumber: true,
  attemptsLeft: true,
  lastGuess: true,
  metadata: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertLearningData = z.infer<typeof insertLearningDataSchema>;
export type LearningData = typeof learningData.$inferSelect;
export type InsertUserInterest = z.infer<typeof insertUserInterestSchema>; 
export type UserInterest = typeof userInterests.$inferSelect;
export type InsertConversationMemory = z.infer<typeof insertConversationMemorySchema>;
export type ConversationMemory = typeof conversationMemory.$inferSelect;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type GameState = typeof gameState.$inferSelect;

// Runtime type for a chat message object (used in the frontend)
export const chatMessageSchema = z.object({
  id: z.number(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
});
