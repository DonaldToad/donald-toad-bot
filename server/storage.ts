import { messages, users, learningData, userInterests, conversationMemory, gameState,
  type User, type InsertUser, type Message, type InsertMessage,
  type LearningData, type InsertLearningData, type UserInterest, type InsertUserInterest,
  type ConversationMemory, type InsertConversationMemory, type GameState, type InsertGameState
} from "@shared/schema";
import { eq, ilike, desc, sql, and, or, not } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByTelegramChatId(chatId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getMessages(): Promise<Message[]>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Learning data methods
  recordQuestion(question: string, topic?: string, userId?: number): Promise<LearningData>;
  getTopQuestions(limit?: number): Promise<LearningData[]>;
  getQuestionsByTopic(topic: string, limit?: number): Promise<LearningData[]>;
  searchSimilarQuestions(question: string, limit?: number): Promise<LearningData[]>;
  
  // User interests methods
  recordUserInterest(userId: number, topic: string, increase?: number): Promise<UserInterest>;
  getUserInterests(userId: number): Promise<UserInterest[]>;
  getTopUserInterests(userId: number, limit?: number): Promise<UserInterest[]>;
  
  // Conversation memory methods
  getConversationMemory(userId: number): Promise<ConversationMemory | undefined>;
  updateConversationMemory(userId: number, updates: Partial<Omit<InsertConversationMemory, 'userId'>>): Promise<ConversationMemory>;
  
  // Game state methods
  getActiveGameState(userId: number): Promise<GameState | undefined>;
  getGameByType(userId: number, gameType: string): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(gameId: number, updates: Partial<Omit<InsertGameState, 'userId' | 'gameType'>>): Promise<GameState>;
  endAllGames(userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private learningEntries: Map<number, LearningData>;
  private userInterests: Map<number, UserInterest>;
  private userConversationMemory: Map<number, ConversationMemory>;
  private userGameStates: Map<number, GameState>;
  private userCurrentId: number;
  private messageCurrentId: number;
  private learningCurrentId: number;
  private interestCurrentId: number;
  private memoryCurrentId: number;
  private gameStateCurrentId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.learningEntries = new Map();
    this.userInterests = new Map();
    this.userConversationMemory = new Map();
    this.userGameStates = new Map();
    this.userCurrentId = 1;
    this.messageCurrentId = 1;
    this.learningCurrentId = 1;
    this.interestCurrentId = 1;
    this.memoryCurrentId = 1;
    this.gameStateCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByTelegramChatId(chatId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.telegramChatId === chatId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    // Ensure platform is set with default value if not provided
    const platform = insertUser.platform || "web";
    // Ensure telegramChatId is null if not provided
    const telegramChatId = insertUser.telegramChatId === undefined ? null : insertUser.telegramChatId;
    
    const user: User = { 
      ...insertUser, 
      id, 
      platform,
      telegramChatId
    };
    this.users.set(id, user);
    return user;
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => a.id - b.id);
  }

  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => a.id - b.id);
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const timestamp = new Date();
    
    // Ensure platform is set with default value if not provided
    const platform = insertMessage.platform || "web";
    // Ensure userId is null if not provided
    const userId = insertMessage.userId === undefined ? null : insertMessage.userId;
    
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp,
      platform,
      userId
    };
    this.messages.set(id, message);
    return message;
  }
  
  // Simple normalization - lowercase, trim, remove duplicate spaces
  private normalizeQuestion(question: string): string {
    return question.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // Extract keywords from the question
  private extractKeywords(question: string): string[] {
    const words = question.toLowerCase().split(/\W+/);
    const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'with', 'about', 'is', 'are', 'am']);
    return words.filter(word => word.length > 2 && !stopWords.has(word));
  }

  async recordQuestion(question: string, topic?: string, userId?: number): Promise<LearningData> {
    const normalizedQuestion = this.normalizeQuestion(question);
    
    // Look for a similar question
    const existingEntry = Array.from(this.learningEntries.values()).find(
      entry => entry.normalizedQuestion === normalizedQuestion
    );
    
    if (existingEntry) {
      // Update existing entry
      existingEntry.frequency = (existingEntry.frequency || 0) + 1;
      existingEntry.lastAskedAt = new Date();
      
      // Add additional metadata if available
      if (userId) {
        const metadata = existingEntry.metadata as any || {};
        if (!metadata.userIds) metadata.userIds = [];
        if (!metadata.userIds.includes(userId)) {
          metadata.userIds.push(userId);
        }
        existingEntry.metadata = metadata;
      }
      
      return existingEntry;
    }
    
    // Create new entry
    const id = this.learningCurrentId++;
    const keywords = this.extractKeywords(question);
    const now = new Date();
    
    const metadata: any = {};
    if (userId) {
      metadata.userIds = [userId];
    }
    
    const entry: LearningData = {
      id,
      question,
      normalizedQuestion,
      topic: topic || null,
      frequency: 1,
      keywords: keywords,
      lastAskedAt: now,
      firstAskedAt: now,
      metadata
    };
    
    this.learningEntries.set(id, entry);
    return entry;
  }

  async getTopQuestions(limit: number = 10): Promise<LearningData[]> {
    return Array.from(this.learningEntries.values())
      .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
      .slice(0, limit);
  }

  async getQuestionsByTopic(topic: string, limit: number = 10): Promise<LearningData[]> {
    return Array.from(this.learningEntries.values())
      .filter(entry => entry.topic === topic)
      .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
      .slice(0, limit);
  }

  async searchSimilarQuestions(question: string, limit: number = 5): Promise<LearningData[]> {
    const normalizedQuestion = this.normalizeQuestion(question);
    const keywords = this.extractKeywords(question);
    
    if (keywords.length === 0) return [];
    
    // Simple similarity score based on keyword match
    const scoredEntries = Array.from(this.learningEntries.values())
      .map(entry => {
        let score = 0;
        for (const keyword of keywords) {
          if (entry.keywords && entry.keywords.includes(keyword)) {
            score += 1;
          }
        }
        return { entry, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    return scoredEntries.slice(0, limit).map(item => item.entry);
  }

  async recordUserInterest(userId: number, topic: string, increase: number = 1): Promise<UserInterest> {
    // Look for existing entry
    const existingEntry = Array.from(this.userInterests.values()).find(
      entry => entry.userId === userId && entry.topic === topic
    );
    
    if (existingEntry) {
      // Update existing entry
      existingEntry.interestLevel = Math.min(10, (existingEntry.interestLevel || 0) + increase);
      existingEntry.lastInteractedAt = new Date();
      return existingEntry;
    }
    
    // Create new entry
    const id = this.interestCurrentId++;
    const now = new Date();
    
    const entry: UserInterest = {
      id,
      userId,
      topic,
      interestLevel: increase,
      firstInteractedAt: now,
      lastInteractedAt: now
    };
    
    this.userInterests.set(id, entry);
    return entry;
  }

  async getUserInterests(userId: number): Promise<UserInterest[]> {
    return Array.from(this.userInterests.values())
      .filter(interest => interest.userId === userId);
  }

  async getTopUserInterests(userId: number, limit: number = 5): Promise<UserInterest[]> {
    return Array.from(this.userInterests.values())
      .filter(interest => interest.userId === userId)
      .sort((a, b) => (b.interestLevel || 0) - (a.interestLevel || 0))
      .slice(0, limit);
  }
  
  // Conversation memory methods
  async getConversationMemory(userId: number): Promise<ConversationMemory | undefined> {
    return Array.from(this.userConversationMemory.values())
      .find(memory => memory.userId === userId);
  }
  
  async updateConversationMemory(userId: number, updates: Partial<Omit<InsertConversationMemory, 'userId'>>): Promise<ConversationMemory> {
    // Check if user already has conversation memory
    const existingMemory = await this.getConversationMemory(userId);
    
    if (existingMemory) {
      // Update existing memory
      const updatedMemory: ConversationMemory = {
        ...existingMemory,
        ...updates,
        numInteractions: (existingMemory.numInteractions || 1) + 1,
        lastInteractedAt: new Date()
      };
      
      this.userConversationMemory.set(existingMemory.id, updatedMemory);
      return updatedMemory;
    } else {
      // Create new memory
      const id = this.memoryCurrentId++;
      const now = new Date();
      
      const newMemory: ConversationMemory = {
        id,
        userId,
        ...updates as any,
        numInteractions: 1,
        lastInteractedAt: now
      };
      
      this.userConversationMemory.set(id, newMemory);
      return newMemory;
    }
  }
  
  // Game state methods
  async getActiveGameState(userId: number): Promise<GameState | undefined> {
    return Array.from(this.userGameStates.values())
      .find(game => game.userId === userId && game.isActive === true);
  }
  
  async getGameByType(userId: number, gameType: string): Promise<GameState | undefined> {
    return Array.from(this.userGameStates.values())
      .find(game => game.userId === userId && game.gameType === gameType && game.isActive === true);
  }
  
  async createGameState(gameStateData: InsertGameState): Promise<GameState> {
    // First end any active games for this user
    await this.endAllGames(gameStateData.userId);
    
    // Create new game state
    const id = this.gameStateCurrentId++;
    const now = new Date();
    
    const newGame: GameState = {
      id,
      ...gameStateData as any,
      isActive: true,
      lastUpdatedAt: now,
      createdAt: now
    };
    
    this.userGameStates.set(id, newGame);
    return newGame;
  }
  
  async updateGameState(gameId: number, updates: Partial<Omit<InsertGameState, 'userId' | 'gameType'>>): Promise<GameState> {
    const existingGame = this.userGameStates.get(gameId);
    
    if (!existingGame) {
      throw new Error(`Game with id ${gameId} not found`);
    }
    
    const updatedGame: GameState = {
      ...existingGame,
      ...updates as any,
      lastUpdatedAt: new Date()
    };
    
    this.userGameStates.set(gameId, updatedGame);
    return updatedGame;
  }
  
  async endAllGames(userId: number): Promise<void> {
    const userGames = Array.from(this.userGameStates.values())
      .filter(game => game.userId === userId && game.isActive === true);
    
    for (const game of userGames) {
      game.isActive = false;
      game.lastUpdatedAt = new Date();
      this.userGameStates.set(game.id, game);
    }
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByTelegramChatId(chatId: string): Promise<User | undefined> {
    if (!chatId) return undefined;
    const [user] = await db.select().from(users).where(eq(users.telegramChatId, chatId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(messages.id);
  }

  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(messages.id);
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  // Helper function to normalize questions for better matching
  private normalizeQuestion(question: string): string {
    return question.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // Helper function to extract keywords from a question
  private extractKeywords(question: string): string[] {
    const words = question.toLowerCase().split(/\W+/);
    const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'with', 'about', 'is', 'are', 'am']);
    return words.filter(word => word.length > 2 && !stopWords.has(word));
  }

  async recordQuestion(question: string, topic?: string, userId?: number): Promise<LearningData> {
    const normalizedQuestion = this.normalizeQuestion(question);
    const keywords = this.extractKeywords(question);
    
    // Check if we have a similar question already
    const [existingEntry] = await db.select().from(learningData)
      .where(eq(learningData.normalizedQuestion, normalizedQuestion));
      
    if (existingEntry) {
      // Update the existing entry
      const [updated] = await db.update(learningData)
        .set({
          frequency: (existingEntry.frequency || 0) + 1,
          lastAskedAt: new Date(),
          // Update metadata if we have user info
          metadata: userId 
            ? { 
                ...existingEntry.metadata as any,
                userIds: [...((existingEntry.metadata as any)?.userIds || []), userId]
              }
            : existingEntry.metadata
        })
        .where(eq(learningData.id, existingEntry.id))
        .returning();
        
      return updated;
    }
    
    // Create a new entry
    const metadata: any = {};
    if (userId) {
      metadata.userIds = [userId];
    }
    
    const [newEntry] = await db.insert(learningData)
      .values({
        question,
        normalizedQuestion,
        topic: topic || null,
        keywords,
        metadata
      })
      .returning();
      
    return newEntry;
  }

  async getTopQuestions(limit: number = 10): Promise<LearningData[]> {
    return await db.select().from(learningData)
      .orderBy(desc(learningData.frequency))
      .limit(limit);
  }

  async getQuestionsByTopic(topic: string, limit: number = 10): Promise<LearningData[]> {
    return await db.select().from(learningData)
      .where(eq(learningData.topic, topic))
      .orderBy(desc(learningData.frequency))
      .limit(limit);
  }

  async searchSimilarQuestions(question: string, limit: number = 5): Promise<LearningData[]> {
    const normalizedQuestion = this.normalizeQuestion(question);
    
    // First try exact match on normalized question
    const [exactMatch] = await db.select().from(learningData)
      .where(eq(learningData.normalizedQuestion, normalizedQuestion));
      
    if (exactMatch) {
      return [exactMatch];
    }
    
    // Then try partial match
    return await db.select().from(learningData)
      .where(ilike(learningData.normalizedQuestion, `%${normalizedQuestion}%`))
      .orderBy(desc(learningData.frequency))
      .limit(limit);
  }

  async recordUserInterest(userId: number, topic: string, increase: number = 1): Promise<UserInterest> {
    // Look for existing entry
    const [existingInterest] = await db.select().from(userInterests)
      .where(and(
        eq(userInterests.userId, userId),
        eq(userInterests.topic, topic)
      ));
      
    if (existingInterest) {
      // Update existing entry
      const newLevel = Math.min(10, (existingInterest.interestLevel || 0) + increase);
      
      const [updated] = await db.update(userInterests)
        .set({
          interestLevel: newLevel,
          lastInteractedAt: new Date()
        })
        .where(eq(userInterests.id, existingInterest.id))
        .returning();
        
      return updated;
    }
    
    // Create new entry
    const [newInterest] = await db.insert(userInterests)
      .values({
        userId,
        topic,
        interestLevel: increase
      })
      .returning();
      
    return newInterest;
  }

  async getUserInterests(userId: number): Promise<UserInterest[]> {
    return await db.select().from(userInterests)
      .where(eq(userInterests.userId, userId));
  }

  async getTopUserInterests(userId: number, limit: number = 5): Promise<UserInterest[]> {
    return await db.select().from(userInterests)
      .where(eq(userInterests.userId, userId))
      .orderBy(desc(userInterests.interestLevel))
      .limit(limit);
  }
  
  // Conversation memory methods
  async getConversationMemory(userId: number): Promise<ConversationMemory | undefined> {
    const [memory] = await db.select().from(conversationMemory)
      .where(eq(conversationMemory.userId, userId));
    return memory;
  }
  
  async updateConversationMemory(userId: number, updates: Partial<Omit<InsertConversationMemory, 'userId'>>): Promise<ConversationMemory> {
    // Check if memory exists for this user
    const existingMemory = await this.getConversationMemory(userId);
    
    if (existingMemory) {
      // Update existing memory
      const [updated] = await db.update(conversationMemory)
        .set({
          ...updates,
          numInteractions: (existingMemory.numInteractions || 1) + 1,
          lastInteractedAt: new Date()
        })
        .where(eq(conversationMemory.id, existingMemory.id))
        .returning();
      
      return updated;
    } else {
      // Create new memory
      const [newMemory] = await db.insert(conversationMemory)
        .values({
          userId,
          ...updates,
          numInteractions: 1
        })
        .returning();
      
      return newMemory;
    }
  }
  
  // Game state methods
  async getActiveGameState(userId: number): Promise<GameState | undefined> {
    const [activeGame] = await db.select().from(gameState)
      .where(and(
        eq(gameState.userId, userId),
        eq(gameState.isActive, true)
      ));
    
    return activeGame;
  }
  
  async getGameByType(userId: number, gameType: string): Promise<GameState | undefined> {
    const [game] = await db.select().from(gameState)
      .where(and(
        eq(gameState.userId, userId),
        eq(gameState.gameType, gameType),
        eq(gameState.isActive, true)
      ));
    
    return game;
  }
  
  async createGameState(gameStateData: InsertGameState): Promise<GameState> {
    // First end any active games for this user
    await this.endAllGames(gameStateData.userId);
    
    // Create new game state
    const [newGame] = await db.insert(gameState)
      .values({
        ...gameStateData,
        isActive: true,
        lastUpdatedAt: new Date(),
        createdAt: new Date()
      })
      .returning();
    
    return newGame;
  }
  
  async updateGameState(gameId: number, updates: Partial<Omit<InsertGameState, 'userId' | 'gameType'>>): Promise<GameState> {
    const [updated] = await db.update(gameState)
      .set({
        ...updates,
        lastUpdatedAt: new Date()
      })
      .where(eq(gameState.id, gameId))
      .returning();
    
    return updated;
  }
  
  async endAllGames(userId: number): Promise<void> {
    await db.update(gameState)
      .set({
        isActive: false,
        lastUpdatedAt: new Date()
      })
      .where(and(
        eq(gameState.userId, userId),
        eq(gameState.isActive, true)
      ));
  }
}

// Use the database storage since we've set up PostgreSQL
export const storage = new DatabaseStorage();
