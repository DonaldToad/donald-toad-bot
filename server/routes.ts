import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { generateChatResponse } from "./openai";
import { generatePerplexityResponse } from "./perplexity";
import { getTokenData, formatTokenDataResponse, getComparisonData, formatComparisonResponse, clearCache, fetchCryptocurrencyPrice } from "./linea-explorer";
import { isDirectMathExpression, solveMathExpression } from "./math-fixed";
import { isRequestingCryptoNews, generateNewsDigest } from "./crypto_news";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint to handle AI responses
  app.post("/api/chat", async (req, res) => {
    try {
      // Validate request body - client sends "message" but server expects "content"
      const validation = z.object({
        message: z.string().min(1),
        provider: z.enum(['auto', 'openai', 'perplexity']).optional()
      }).safeParse(req.body);

      if (!validation.success) {
        console.log("Validation failed:", req.body);
        return res.status(400).json({ message: "Invalid message content" });
      }

      const { message: content, provider = 'auto' } = validation.data;

      // Save user message to storage
      const userMessage = await storage.createMessage({
        role: "user",
        content,
        platform: "web"
      });

      // Use our simplified math detection from math-fixed module
      // This provides a cleaner and more reliable way to detect direct math operations
      const isMathQuery = isDirectMathExpression(content);
      
      // For logging - identify the specific operation if it's direct math
      let mathOperationType = '';
      if (isMathQuery) {
        if (/\+/.test(content)) mathOperationType = 'addition';
        else if (/\-/.test(content)) mathOperationType = 'subtraction';
        else if (/\*/.test(content)) mathOperationType = 'multiplication (*)';
        else if (/[xX]/.test(content)) mathOperationType = 'multiplication (x)';
        else if (/\//.test(content)) mathOperationType = 'division';
      }
      
      // DEBUG LOGGING
      console.log("MATH OPERATION CHECK:");
      console.log("- Input:", content);
      console.log("- Is direct math operation:", isMathQuery);
      if (isMathQuery) console.log("- Type detected:", mathOperationType);
      
      // Check for special cryptocurrency price queries before normal processing
      const isBitcoinPriceQuery = !isMathQuery && /\b((bitcoin|btc).*price|price.*(bitcoin|btc)|how much.*bitcoin|bitcoin.*worth|value of.*bitcoin)\b/i.test(content);
      const isEthereumPriceQuery = !isMathQuery && /\b((ethereum|eth).*price|price.*(ethereum|eth)|how much.*ethereum|ethereum.*worth|value of.*ethereum)\b/i.test(content);
      
      // Add extensive logging to help diagnose response issues
      console.log("Request analysis:");
      console.log("- Original message:", content);
      console.log("- Direct math operation detected:", isMathQuery);
      console.log("- Bitcoin price query:", isBitcoinPriceQuery);
      console.log("- Ethereum price query:", isEthereumPriceQuery);
      
      if (isBitcoinPriceQuery) {
        try {
          console.log("Detected Bitcoin price query, using dedicated handler");
          const btcPrice = await fetchCryptocurrencyPrice('bitcoin');
          
          // Get random Donald Toad style elements
          const toadAdjectives = ["tremendous", "huge", "great", "amazing", "fantastic", "incredible", "beautiful", 
                                 "perfect", "wonderful", "excellent", "spectacular", "magnificent", "terrific"];
          const toadPhrases = ["Believe me, folks!", "That I can tell you!", "Many people are saying it!", 
                              "Everyone knows it!", "That's what they tell me!", "Make Crypto Great Again!", 
                              "So much winning!", "Nobody knows crypto better than me!", 
                              "We're going to win so much, you'll get tired of winning!"];
          
          const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
          const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
          
          // Create Bitcoin price response
          const assistantContent = `Bitcoin is currently trading at ${btcPrice}! That's a ${randomAdj} price for the world's premier cryptocurrency! Started at almost ZERO and reached new all-time highs above $100,000 - what a success story, like my businesses! Some say it could reach $1 million someday - I say think BIGGER! Bitcoin was the first crypto revolution, and Donald Toad Coin is the next! Both should be in every SMART investor's portfolio! ${randomPhrase}`;
          
          // Record this as a bitcoin topic
          await storage.recordQuestion(content, "bitcoin");
          
          // Save the assistant message
          const assistantMessage = await storage.createMessage({
            role: "assistant",
            content: assistantContent,
            platform: "web"
          });
          
          return res.status(200).json(assistantMessage);
        } catch (error) {
          console.error("Failed to process Bitcoin price query:", error);
          // Fall through to normal processing
        }
      }
      
      if (isEthereumPriceQuery) {
        try {
          console.log("Detected Ethereum price query, using dedicated handler");
          const ethPrice = await fetchCryptocurrencyPrice('ethereum');
          
          // Get random Donald Toad style elements
          const toadAdjectives = ["tremendous", "huge", "great", "amazing", "fantastic", "incredible", "beautiful", 
                                 "perfect", "wonderful", "excellent", "spectacular", "magnificent", "terrific"];
          const toadPhrases = ["Believe me, folks!", "That I can tell you!", "Many people are saying it!", 
                              "Everyone knows it!", "That's what they tell me!", "Make Crypto Great Again!", 
                              "So much winning!", "Nobody knows crypto better than me!", 
                              "We're going to win so much, you'll get tired of winning!"];
          
          const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
          const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
          
          // Create Ethereum price response
          const assistantContent = `Ethereum is currently trading at ${ethPrice}! A ${randomAdj} price for the world's leading smart contract platform! Started as Vitalik's vision and now powers thousands of dApps, DeFi protocols, and NFTs! Linea Network, where Donald Toad Coin lives, is an Ethereum Layer 2 - we build on the BEST technology! Ethereum revolutionized blockchain with programmable money - very innovative, tremendously important! ${randomPhrase}`;
          
          // Record this as an ethereum topic
          await storage.recordQuestion(content, "ethereum");
          
          // Save the assistant message
          const assistantMessage = await storage.createMessage({
            role: "assistant",
            content: assistantContent,
            platform: "web"
          });
          
          return res.status(200).json(assistantMessage);
        } catch (error) {
          console.error("Failed to process Ethereum price query:", error);
          // Fall through to normal processing
        }
      }
      
      // Process math expressions with our new simplified solver
      if (isMathQuery) {
        console.log("MATH DETECTION CONFIRMED: Processing math expression:", content);
        
        // We know this is a direct math operation, so we can just solve it directly
        console.log("Final expression to solve:", content);
        
        // Solve the math expression using our simplified solver
        const calculatorResponse = solveMathExpression(content);
        console.log("MATH RESPONSE:", calculatorResponse);
        
        // Record this as a math topic
        await storage.recordQuestion(content, "math");
        
        // Save the assistant message with our calculated response
        const assistantMessage = await storage.createMessage({
          role: "assistant",
          content: calculatorResponse,
          platform: "web"
        });
        
        return res.status(200).json(assistantMessage);
      }
      
      try {
        // First try with the primary AI service
        let assistantContent: string;
        
        // Handle different provider selections
        if (provider === 'perplexity') {
          // Perplexity only
          assistantContent = await generatePerplexityResponse(content);
          console.log("Using Perplexity exclusively for response");
        } 
        else if (provider === 'openai') {
          // OpenAI only
          assistantContent = await generateChatResponse(content);
          console.log("Using OpenAI exclusively for response");
        }
        else {
          // Auto mode - use OpenAI only, avoid the double-response issue
          assistantContent = await generateChatResponse(content);
          console.log("Successfully used OpenAI for response (auto mode)");
        }

        // Save assistant message to storage
        const assistantMessage = await storage.createMessage({
          role: "assistant",
          content: assistantContent,
          platform: "web"
        });

        // Return the assistant message
        return res.status(200).json(assistantMessage);
      } catch (error: any) {
        console.error("AI response generation error:", error);
        
        // Return a generic error message to the client
        return res.status(500).json({ 
          message: `Error generating AI response: ${error.message}` 
        });
      }
    } catch (error: any) {
      console.error("Server error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get message history
  app.get("/api/messages", async (req, res) => {
    try {
      // Get web-based messages only (exclude telegram messages)
      const messages = await storage.getMessages();
      const webMessages = messages.filter(msg => msg.platform === "web" || !msg.platform);
      res.status(200).json(webMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  // Dedicated math problem solver endpoint
  app.post("/api/math/solve", async (req, res) => {
    try {
      // Validate request body
      const validation = z.object({
        expression: z.string().min(1),
      }).safeParse(req.body);

      if (!validation.success) {
        console.log("Math validation failed:", req.body);
        return res.status(400).json({ message: "Invalid expression" });
      }

      const { expression } = validation.data;
      console.log("Attempting to solve math expression from dedicated endpoint:", expression);
      
      // Check if this is a direct math expression we can solve
      if (isDirectMathExpression(expression)) {
        // Solve the math expression with our simplified solver
        const mathSolution = solveMathExpression(expression);
        console.log("Solution:", mathSolution);
        return res.status(200).json({ 
          result: mathSolution 
        });
      } else {
        console.log("Not a direct math expression, cannot solve");
        return res.status(400).json({ 
          message: "Could not find a math expression to solve" 
        });
      }
      
    } catch (error: any) {
      console.error("Math solver error:", error);
      return res.status(500).json({ 
        message: `Error solving math problem: ${error.message}` 
      });
    }
  });
  
  // Perplexity API endpoint - separate from the main chat endpoint
  // Direct chat response endpoint for Telegram and test scripts
  app.post("/api/chatResponse", async (req, res) => {
    try {
      // Validate request body
      const validation = z.object({
        message: z.string().min(1),
        userId: z.string().optional()
      }).safeParse(req.body);

      if (!validation.success) {
        console.log("Validation failed:", req.body);
        return res.status(400).json({ message: "Invalid message content" });
      }

      const { message: content, userId = 'web-user' } = validation.data;

      // Check if message is requesting crypto news
      if (isRequestingCryptoNews(content)) {
        console.log("Crypto news request detected in API");
        try {
          // Get interests from user ID if available
          const userInterests = ['bitcoin', 'ethereum', 'crypto', 'defi'];
          
          // Generate news digest
          const newsDigest = await generateNewsDigest(userId, userInterests);
          return res.status(200).json({ content: newsDigest });
        } catch (error) {
          console.error("Error generating news digest:", error);
          return res.status(500).json({ 
            content: "I tried to get you the latest crypto news, but something went wrong! The fake news media is TERRIBLE! Try again later, folks! 🐸" 
          });
        }
      }

      // If not a news request, fall back to standard chat response
      try {
        const response = await generateChatResponse(content, userId);
        return res.status(200).json({ content: response });
      } catch (error) {
        console.error("Error generating chat response:", error);
        return res.status(500).json({ 
          content: "I'm having trouble processing that request. Could you try again?" 
        });
      }
    } catch (error) {
      console.error("Server error in chatResponse:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/chat/perplexity", async (req, res) => {
    try {
      // Validate request body
      const validation = z.object({
        message: z.string().min(1),
      }).safeParse(req.body);

      if (!validation.success) {
        console.log("Validation failed:", req.body);
        return res.status(400).json({ message: "Invalid message content" });
      }

      const { message: content } = validation.data;

      // Save user message to storage
      const userMessage = await storage.createMessage({
        role: "user",
        content,
        platform: "web-perplexity" // Mark as using Perplexity
      });

      try {
        // Get response from Perplexity API
        const assistantContent = await generatePerplexityResponse(content);

        // Save assistant message to storage
        const assistantMessage = await storage.createMessage({
          role: "assistant",
          content: assistantContent,
          platform: "web-perplexity"
        });

        // Return the assistant message
        return res.status(200).json(assistantMessage);
      } catch (error: any) {
        console.error("Perplexity API error:", error);
        
        // Return a generic error message to the client
        return res.status(500).json({ 
          message: `Error generating Perplexity response: ${error.message}` 
        });
      }
    } catch (error: any) {
      console.error("Server error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get top questions from learning data
  app.get("/api/learning/top-questions", async (req, res) => {
    try {
      // Get query param for limit
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Get top questions
      const topQuestions = await storage.getTopQuestions(limit);
      res.status(200).json(topQuestions);
    } catch (error) {
      console.error("Failed to fetch top questions:", error);
      res.status(500).json({ message: "Failed to fetch top questions" });
    }
  });
  
  // Get questions by topic
  app.get("/api/learning/questions-by-topic/:topic", async (req, res) => {
    try {
      const { topic } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Get questions for this topic
      const questions = await storage.getQuestionsByTopic(topic, limit);
      res.status(200).json(questions);
    } catch (error) {
      console.error(`Failed to fetch questions for topic ${req.params.topic}:`, error);
      res.status(500).json({ message: "Failed to fetch questions by topic" });
    }
  });
  
  // Get user interests for a specific user
  app.get("/api/learning/user-interests/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Validate userId
      if (isNaN(parseInt(userId))) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get user interests
      const interests = await storage.getUserInterests(parseInt(userId));
      res.status(200).json(interests);
    } catch (error) {
      console.error(`Failed to fetch interests for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to fetch user interests" });
    }
  });
  
  // Get top interests for a specific user
  app.get("/api/learning/top-user-interests/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      // Validate userId
      if (isNaN(parseInt(userId))) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get top user interests
      const interests = await storage.getTopUserInterests(parseInt(userId), limit);
      res.status(200).json(interests);
    } catch (error) {
      console.error(`Failed to fetch top interests for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to fetch top user interests" });
    }
  });

  // Get Donald Toad Coin token data
  app.get("/api/token-data", async (req, res) => {
    try {
      // Get token data for DTC
      const tokenData = await getTokenData();
      
      // Format as JSON or text based on format parameter
      const format = req.query.format === 'text' ? 'text' : 'json';
      
      if (format === 'text') {
        // Return formatted text response
        const formattedData = formatTokenDataResponse(tokenData);
        res.set('Content-Type', 'text/plain').send(formattedData);
      } else {
        // Return JSON data
        res.status(200).json(tokenData);
      }
    } catch (error: any) {
      console.error('Failed to fetch token data:', error);
      res.status(500).json({ 
        message: "Failed to fetch token data",
        error: error.message || 'Unknown error'
      });
    }
  });
  
  // Get meme coin comparison data (DTC vs Foxy vs Croak)
  app.get("/api/token-comparison", async (req, res) => {
    try {
      // Get comparison data for all tokens
      const comparisonData = await getComparisonData();
      
      // Format as JSON or text based on format parameter
      const format = req.query.format === 'text' ? 'text' : 'json';
      
      if (format === 'text') {
        // Return formatted text response
        const formattedData = formatComparisonResponse(comparisonData);
        res.set('Content-Type', 'text/plain').send(formattedData);
      } else {
        // Return JSON data
        res.status(200).json(comparisonData);
      }
    } catch (error: any) {
      console.error('Failed to fetch token comparison data:', error);
      res.status(500).json({ 
        message: "Failed to fetch token comparison data",
        error: error.message || 'Unknown error'
      });
    }
  });
  
  // Clear token data cache to force fresh data fetching
  app.post("/api/token-cache/clear", (req, res) => {
    try {
      // Clear token data cache
      clearCache();
      res.status(200).json({ 
        success: true, 
        message: "Token data cache cleared successfully" 
      });
    } catch (error: any) {
      console.error('Failed to clear token data cache:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to clear token data cache", 
        error: error.message || 'Unknown error'
      });
    }
  });
  
  // Get Bitcoin price with Toad-style response
  app.get("/api/crypto/bitcoin", async (req, res) => {
    try {
      // Get real-time Bitcoin price
      const btcPrice = await fetchCryptocurrencyPrice('bitcoin');
      
      // Get random adjective and phrase for Donald Toad style
      const toadAdjectives = ["tremendous", "huge", "great", "amazing", "fantastic", "incredible", "beautiful", 
                             "perfect", "wonderful", "excellent", "spectacular", "magnificent", "terrific"];
      const toadPhrases = ["Believe me, folks!", "That I can tell you!", "Many people are saying it!", 
                          "Everyone knows it!", "That's what they tell me!", "Make Crypto Great Again!", 
                          "So much winning!", "Nobody knows crypto better than me!", 
                          "We're going to win so much, you'll get tired of winning!"];
      
      const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
      const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
      
      // Format response
      const format = req.query.format === 'text' ? 'text' : 'json';
      
      if (format === 'text') {
        // Return formatted text response
        const formattedResponse = `Bitcoin is currently trading at ${btcPrice}! That's a ${randomAdj} price for the world's premier cryptocurrency! Started at almost ZERO and reached new all-time highs above $100,000 - what a success story, like my businesses! Some say it could reach $1 million someday - I say think BIGGER! Bitcoin was the first crypto revolution, and Donald Toad Coin is the next! Both should be in every SMART investor's portfolio! ${randomPhrase}`;
        res.set('Content-Type', 'text/plain').send(formattedResponse);
      } else {
        // Return JSON data
        res.status(200).json({
          price: btcPrice,
          currency: 'USD',
          coin: 'Bitcoin',
          message: `That's a ${randomAdj} price for the world's premier cryptocurrency! ${randomPhrase}`,
          lastUpdated: new Date()
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch Bitcoin price:', error);
      res.status(500).json({ 
        message: "Failed to fetch Bitcoin price",
        error: error.message || 'Unknown error'
      });
    }
  });
  
  // Get Ethereum price with Toad-style response
  app.get("/api/crypto/ethereum", async (req, res) => {
    try {
      // Get real-time Ethereum price
      const ethPrice = await fetchCryptocurrencyPrice('ethereum');
      
      // Get random adjective and phrase for Donald Toad style
      const toadAdjectives = ["tremendous", "huge", "great", "amazing", "fantastic", "incredible", "beautiful", 
                             "perfect", "wonderful", "excellent", "spectacular", "magnificent", "terrific"];
      const toadPhrases = ["Believe me, folks!", "That I can tell you!", "Many people are saying it!", 
                          "Everyone knows it!", "That's what they tell me!", "Make Crypto Great Again!", 
                          "So much winning!", "Nobody knows crypto better than me!", 
                          "We're going to win so much, you'll get tired of winning!"];
      
      const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
      const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
      
      // Format response
      const format = req.query.format === 'text' ? 'text' : 'json';
      
      if (format === 'text') {
        // Return formatted text response
        const formattedResponse = `Ethereum is currently trading at ${ethPrice}! A ${randomAdj} price for the world's leading smart contract platform! Started as Vitalik's vision and now powers thousands of dApps, DeFi protocols, and NFTs! Linea Network, where Donald Toad Coin lives, is an Ethereum Layer 2 - we build on the BEST technology! Ethereum revolutionized blockchain with programmable money - very innovative, tremendously important! ${randomPhrase}`;
        res.set('Content-Type', 'text/plain').send(formattedResponse);
      } else {
        // Return JSON data
        res.status(200).json({
          price: ethPrice,
          currency: 'USD',
          coin: 'Ethereum',
          message: `A ${randomAdj} price for the world's leading smart contract platform! ${randomPhrase}`,
          lastUpdated: new Date()
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch Ethereum price:', error);
      res.status(500).json({ 
        message: "Failed to fetch Ethereum price",
        error: error.message || 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
