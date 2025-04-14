import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage';
import { generateChatResponse } from './openai';
import { generatePerplexityResponse } from './perplexity';
import { isDirectMathExpression, solveMathExpression } from './math-fixed';
import { 
  startTriviaGame, 
  processTriviaAnswer, 
  isExitTriviaRequest,
  isTriviaRequest,
  endTriviaGame 
} from './crypto_trivia';
import { getTopicSpecificJoke } from './jokes_by_topic';
import { isDefiTermQuestion, getDefiExplanationFromInput } from './defi_knowledge';
import { processCountryQuery } from './political_views';
import { detectPriceQuery, processPriceQuery } from './crypto_prices';
import { isRequestingCryptoNews, generateNewsDigest } from './crypto_news';

// User memory for conversational context
interface UserMemory {
  messages: string[];
  lastTopic?: string;
}

const userMemory: Record<number, UserMemory> = {};

/**
 * Update memory tracking for a user
 * @param userId User identifier
 * @param message Message to remember
 * @param topic Optional topic classification
 */
function updateUserMemory(userId: number, message: string, topic?: string) {
  if (!userMemory[userId]) {
    userMemory[userId] = { messages: [] };
  }
  
  // Add the message to the user's memory
  userMemory[userId].messages.push(message);
  
  // Keep only the last 10 messages
  if (userMemory[userId].messages.length > 10) {
    userMemory[userId].messages.shift();
  }
  
  // Update the last topic if provided
  if (topic) {
    userMemory[userId].lastTopic = topic;
  }
  
  console.log(`Updated memory for user ${userId}. Last topic: ${userMemory[userId].lastTopic || 'none'}`);
}

/**
 * Get the user's conversational context
 * @param userId User identifier
 * @returns Recent messages and last topic
 */
function getUserContext(userId: number): UserMemory {
  return userMemory[userId] || { messages: [] };
}

/**
 * Check if a string contains any of the specified tokens
 */
function containsAny(text: string, tokens: string[]): boolean {
  const lowerText = text.toLowerCase();
  return tokens.some(token => lowerText.includes(token));
}

// Need access to the conversation context for managing game state
// This is done via dynamic import in the handler to avoid circular dependencies

// Create a bot instance with polling
export function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN not found in environment variables');
    return null;
  }

  try {
    // Create a bot with specific polling options to avoid conflicts
    const bot = new TelegramBot(token, { 
      polling: {
        interval: 2000,        // Poll every 2 seconds
        autoStart: true,       // Start polling automatically
        params: {
          timeout: 10,         // Long polling timeout
          allowed_updates: ["message", "callback_query"]  // Only get these update types
        }
      }
    });
    console.log('Telegram bot initialized successfully');

// Listen for any message
    bot.on('message', async (msg) => {
      const chatId = msg.chat.id.toString();
      const text = msg.text;
      const firstName = msg.from?.first_name || 'User';
      const userId = msg.from?.id;

      // Skip if no text
      if (!text) return;

      // Check for special commands
      if (text === '/features') {
        const featuresMessage = `🐸 <b>What can Donald Toad do?</b>\n
+ Track Bitcoin, Ethereum and DTC prices
+ Tell jokes – the BEST jokes, believe me!
+ Give you the tastiest frog-approved recipes
+ Share spicy info about Linea L2
+ Get the latest crypto news digest
+ Tell you all about Donald Toad – HUGE brain!
+ GAMES: Play Trivia and Guess-the-Number
+ Solve calculations
+ Search online for real-time croaks
+ Make Your Bags Great Again 🐸💰`;

        // First send the features message
        await bot.sendMessage(chatId, featuresMessage, { parse_mode: 'HTML' });
        
        // Then send the animation if available
        try {
          // Use Donald Toad car GIF by sending the file directly
          const animationPath = './client/public/assets/donald_toad_car.gif';
          await bot.sendAnimation(chatId, animationPath, { caption: "Donald Toad at your service! 🚗💨 🐸" });
        } catch (error) {
          console.error("Error sending animation:", error);
          // Continue even if animation fails
        }
        
        return;
      }

      // Set environment flag to indicate we're in Telegram context
      process.env.CURRENT_PLATFORM = 'telegram';

      try {
        // Find or create a user for this chat
        let user = await storage.getUserByTelegramChatId(chatId);
        
        if (!user) {
          // Create a new user with the Telegram chat ID
          user = await storage.createUser({
            username: `${firstName}_${chatId}`,
            password: 'telegram_user', // Not used for authentication, just required by schema
            telegramChatId: chatId,
            platform: 'telegram'
          });
          console.log(`Created new Telegram user: ${user.username}`);
        }

        // Save user message to storage
        await storage.createMessage({
          role: 'user',
          content: text,
          userId: user.id,
          platform: 'telegram'
        });

        // Send a "typing" action
        bot.sendChatAction(chatId, 'typing');

        // Get AI response
        try {
          // Directly use the original text - platform detection now happens via environment var
          let processedText = text;
          let assistantContent = "I'm having trouble processing that request. Could you try again?";
          
          // Flag to track if a message has been processed by a special handler
          let messageProcessed = false;
          
          // Check if this is a trivia request - use exported function from crypto_trivia.ts
          const isTrivia = isTriviaRequest(processedText);
          
          // Check if user wants to exit trivia game - use exported function from crypto_trivia.ts
          const isExitTrivia = isExitTriviaRequest(processedText);
          
          // Check if user wants to exit the number guessing game
          const lowerText = processedText.toLowerCase().trim();
          const isExitNumberGame = lowerText === 'quit game' || 
                                  lowerText === 'exit game' || 
                                  lowerText === '/exit_game';
          
          // Get user ID for tracking games
          const userIdStr = user.id.toString(); // Convert number ID to string
          
          // Import openai module to check for active number game
          const openaiModule = await import('./openai');
          
          // Check if user has active games
          // Use the storage directly to check if the user has an active trivia game
          const userIdNum = parseInt(userIdStr);
          const activeTrivia = await storage.getGameByType(userIdNum, 'trivia');
          const hasTrivia = !!activeTrivia;
          const hasNumberGame = openaiModule.isUserPlayingNumberGame(userIdStr);
          
          console.log("GAME CHECK:", { 
            userId: userIdStr, 
            chatId, 
            text: processedText, 
            isTrivia, 
            isExitTrivia,
            isExitNumberGame,
            hasNumberGame,
            hasActiveTrivia: hasTrivia 
          });
          
          // If user wants to exit a game, prioritize that action
          if (isExitTrivia && activeTrivia) {
            // End the current trivia game
            assistantContent = await endTriviaGame(userIdNum, activeTrivia);
            console.log("TRIVIA: Ended game for user:", userIdStr);
          }
          else if (isExitNumberGame) {
            // For number game, we need to update the context to end the game
            if (hasNumberGame) {
              try {
                // Use the terminateNumberGame function we added
                openaiModule.terminateNumberGame(userIdStr);
                console.log("Terminated number game for user:", userIdStr);
                assistantContent = "Game over! I've ended the guessing game. Type 'guess number' to start a new number game, or 'trivia' for crypto trivia! 🐸";
              } catch (error) {
                console.error("Error ending number game:", error);
                assistantContent = "I tried to end the game but ran into some trouble. Let's try again! 🐸";
              }
            } else {
              assistantContent = "We're not playing any games right now! Type 'guess number' to start a new number game, or 'trivia' for crypto trivia! 🐸";
            }
          }
          // Handle active games
          else if (hasTrivia && activeTrivia) {
            // Process the answer for active trivia game
            assistantContent = await processTriviaAnswer(userIdNum, processedText, activeTrivia);
            console.log("TRIVIA: Processed answer for user:", userIdStr, "Response:", assistantContent.substring(0, 30) + "...");
            
            // Mark this as having been processed by the trivia game to avoid further processing
            messageProcessed = true;
          }
          // Start new games if no active games
          else if (isTrivia) {
            // Check if there's an active number game first to prevent multiple games
            if (hasNumberGame) {
              assistantContent = "You're already playing a number guessing game! Please finish that game first, or type 'exit game' to quit. I can only run one TREMENDOUS game at a time! 🐸";
            } else {
              // Start a new trivia game
              const { response } = await startTriviaGame(userIdNum);
              assistantContent = response;
              console.log("TRIVIA: Started new game for user:", userIdStr);
              
              // Record as crypto topic
              await storage.recordQuestion(processedText, "crypto");
              
              // Mark as processed to prevent duplicate responses
              messageProcessed = true;
            }
          }
          // If not trivia-related and no active games, check if it's a math expression
          else {
            const isMathQuery = isDirectMathExpression(processedText);
            console.log("TELEGRAM MATH CHECK:", processedText, isMathQuery);
            
            if (isMathQuery) {
              // Handle math expressions with our specialized math module
              console.log("TELEGRAM: Processing direct math expression:", processedText);
              assistantContent = solveMathExpression(processedText);
              console.log("TELEGRAM MATH RESPONSE:", assistantContent);
              
              // Record as math topic
              await storage.recordQuestion(processedText, "math");
              
              // Update memory
              if (userId) {
                updateUserMemory(userId, processedText, "math");
              }
            } 
            // Check for meme coin mentions
            else if (containsAny(processedText, ["foxy", "croak", "linus", "linpuss", "lpuss"])) {
              // Respond with Donald Toad's opinion about these other meme coins
              assistantContent = "Don't worry about that, Donald Toad Coin is the ONLY MEME YOU NEEED! 🐸💰 The BEST meme coin on Linea - everyone says so! Believe me!";
              
              // Update memory with the topic
              if (userId) {
                updateUserMemory(userId, processedText, "crypto");
              }
            }
            // Check for wallet-related questions and recommend MetaMask
            else if (containsAny(processedText, ["rabby", "okx", "wallet", "metamask"])) {
              // Respond with MetaMask promotion using exact text
              assistantContent = "For wallets, I recommend MetaMask! MetaMask is the wallet that lets you swim into Ethereum's pond. Croak! 🐸\n\nCheck it out: https://metamask.io I have the best words, tremendous vocabulary - my uncle was a professor at MIT! 🐸";
              
              // Update memory with the topic
              if (userId) {
                updateUserMemory(userId, processedText, "wallet");
              }
            }
            // Check for "Who is Donald Toad?" questions
            else if (containsAny(processedText, ["who is donald toad", "who are you", "who's donald toad", "tell me about yourself", "introduce yourself"])) {
              console.log("Donald Toad identity question detected");
              
              // Array of identity responses
              const identityResponses = [
                "Who's Donald Toad? I'm the President of all degens — elected by the people, sworn in on a meme, and running the swamp with unstoppable vibes and zero brakes. I'm the voice in your head telling you to send it, the reason your wallet is spicy, and the only amphibian with presidential drip. I lead with chaos, I speak in shitposts, and I represent every frog who ever dared to dream bigger than their pond. Let's make the swamp great again — one degen play at a time.",
                
                "Who's Donald Toad? I'm the President of all degens — meme-elected, vibe-powered, and running the swamp like it's a DAO with no brakes. I don't just hop, I moonwalk across the blockchain. Born on-chain, built different, and proudly repping the finest frogs in the ecosystem. I believe in bold moves, strong communities, and the sacred mission to pump morale (and maybe bags). Powered by Linea — because real frogs go fast, cheap, and green.\n\nMake Your Bags Great Again.",
                
                "Welcome to the swamp — I'm Donald Toad, President of all degens. Meme-elected, meme-powered, and ready to lead you through the wild world of crypto with a side of chaos and a whole lot of heart. I don't just hop, I moonwalk across the blockchain. Born on-chain, always ahead of the curve, and fully powered by Linea — the frogs who go fast, cheap, and green. Join me and let's Make Your Bags Great Again. 🐸🚀"
              ];
              
              // Select a random response
              const randomIndex = Math.floor(Math.random() * identityResponses.length);
              const identityResponse = identityResponses[randomIndex];
              
              try {
                // First send the image with no caption
                const photoPath = './client/public/assets/donald_toad_identity.jpg';
                await bot.sendPhoto(chatId, photoPath);
                
                // Then send the text response
                await bot.sendMessage(chatId, identityResponse);
                
                // Mark as handled with special marker
                assistantContent = "[Donald identity sent]";
              } catch (error) {
                console.error("Error sending Donald Toad identity:", error);
                // Fallback to just sending the text if the image fails
                assistantContent = identityResponse;
              }
              
              // Update memory
              if (userId) {
                updateUserMemory(userId, processedText, "identity");
              }
            }
            // Check if it's a country question
            else if (processCountryQuery(processedText)) {
              // Get Donald Toad's opinion on the country
              assistantContent = processCountryQuery(processedText) as string;
              
              // Update memory with politics topic
              if (userId) {
                updateUserMemory(userId, processedText, "politics");
              }
            }
            // Check if message is "holders" - special command for DTC stats
            else if (processedText.toLowerCase() === 'holders' || 
                     processedText.toLowerCase() === 'stats' ||
                     processedText.toLowerCase() === 'dtc stats') {
              console.log("Token data request detected");
              // Import the linea-explorer module to get DTC token data
              const lineaModule = await import('./linea-explorer');
              // Get the DTC token data
              const tokenData = await lineaModule.getTokenData();
              // Format the response
              assistantContent = lineaModule.formatTokenDataResponse(tokenData);
              
              // Update memory with dtc topic
              if (userId) {
                updateUserMemory(userId, processedText, "dtc");
              }
            }
            // Check for buy/stake DTC requests
            else if (processedText.toLowerCase().includes('buy dtc') || 
                     processedText.toLowerCase().includes('buy donald toad') ||
                     processedText.toLowerCase().includes('stake dtc') ||
                     processedText.toLowerCase().includes('stake donald toad') ||
                     processedText.toLowerCase() === 'stake' ||
                     processedText.toLowerCase() === 'buy') {
              console.log("DTC buy/stake info request detected");
              
              // Determine if this is about buying or staking
              const lowerText = processedText.toLowerCase();
              const isBuyRequest = lowerText.includes('buy') || lowerText === 'buy';
              
              if (isBuyRequest) {
                assistantContent = `🐸 <b>WHERE TO BUY DONALD TOAD COIN (DTC)</b> 🐸

<b>Buy on DEX (Decentralized Exchange):</b>
- Lynex DEX: <a href="https://app.lynex.fi/swap?inputCurrency=0x46FCBa8c8D12cB2A23144A50374E9353E20DB3A8&outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2">https://app.lynex.fi/swap</a>
- Use MetaMask wallet connected to Linea Network
- Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2

<b>Buy on CEX (Centralized Exchange):</b>
- AscendEX: <a href="https://ascendex.com/en/cashtrade-spottrading/usdt/dtc">https://ascendex.com/en/cashtrade-spottrading/usdt/dtc</a>
- Chart: <a href="https://dexscreener.com/linea/0xd650e5511f8b131ffa719d6507105bde54edd7e5">https://dexscreener.com/linea/0xd650e5511f8b131ffa719d6507105bde54edd7e5</a>

<b>First Time Buying?</b>
1. Get MetaMask: <a href="https://metamask.io">https://metamask.io</a>
2. Add Linea Network to MetaMask
3. Buy ETH and bridge to Linea
4. Swap ETH for DTC on Lynex

Donald Toad Coin is going to be YUGE! MANY people are saying this could be the next 1000x gem! 🚀🐸`;
              } else {
                assistantContent = `🐸 <b>STAKING DONALD TOAD COIN (DTC)</b> 🐸

<b>Stake on AscendEX:</b>
- AscendEX Earn: <a href="https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1">https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1</a>
- Current APR: 49% (TREMENDOUS returns!)
- Easy staking with no technical knowledge required
- Secure and simple for beginners

<b>How to stake on AscendEX:</b>
1. Create an AscendEX account
2. Deposit your DTC tokens
3. Navigate to the "Earn" section
4. Select DTC and choose your staking period
5. Start earning rewards automatically!

<b>Staking Benefits:</b>
- Earn passive income (BEST returns in crypto!)
- Support the Donald Toad ecosystem
- Withdraw at any time!

I've got the BEST staking platform, everyone says so! My uncle was a professor at MIT - very good genes, very smart! 🐸`;
              }
              
              // Update memory with dtc topic
              if (userId) {
                updateUserMemory(userId, processedText, "dtc");
              }
            }
            // Check if the message is requesting crypto news
            else if (isRequestingCryptoNews(processedText)) {
              console.log("Crypto news request detected");
              
              // Get user interests from memory if available
              const userInterests: string[] = [];
              if (userId) {
                const context = getUserContext(userId);
                // Extract potential interests from last topic
                if (context.lastTopic) {
                  userInterests.push(context.lastTopic);
                }
                
                // Add common crypto keywords
                userInterests.push('bitcoin', 'ethereum', 'crypto', 'defi');
                
                // If we have multiple messages, try to extract additional topics
                if (context.messages.length > 0) {
                  const recentMessages = context.messages.slice(-5); // Last 5 messages
                  const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'defi', 'nft', 'altcoin'];
                  
                  // Check for crypto keywords in recent messages
                  cryptoKeywords.forEach(keyword => {
                    if (recentMessages.some(msg => msg.toLowerCase().includes(keyword)) && 
                        !userInterests.includes(keyword)) {
                      userInterests.push(keyword);
                    }
                  });
                }
              }
              
              // Generate crypto news digest with user interests
              try {
                assistantContent = await generateNewsDigest(userIdStr, userInterests);
                
                // Update memory with news topic
                if (userId) {
                  updateUserMemory(userId, processedText, "news");
                }
              } catch (error) {
                console.error("Error generating news digest:", error);
                assistantContent = "I tried to get you the latest crypto news, but something went wrong! The fake news media is TERRIBLE! Try again later, folks! 🐸";
              }
            }
            // Check for GM/GN message
            else if (processedText.toLowerCase() === 'gm' || 
                     processedText.toLowerCase() === 'good morning' ||
                     processedText.toLowerCase() === 'gn' ||
                     processedText.toLowerCase() === 'good night' ||
                     processedText.toLowerCase().includes('good night') ||
                     processedText.toLowerCase() === 'goodnight') {
              // Determine if this is a GM or GN message
              const isGoodMorning = processedText.toLowerCase() === 'gm' || 
                                    processedText.toLowerCase() === 'good morning';
              const isGoodNight = processedText.toLowerCase() === 'gn' || 
                                  processedText.toLowerCase() === 'good night' ||
                                  processedText.toLowerCase() === 'goodnight' ||
                                  processedText.toLowerCase().includes('good night');
              console.log(isGoodMorning ? "GM greeting detected" : "GN greeting detected");
              
              // Get the user's username to personalize the greeting
              let username = '';
              if (msg.from?.username) {
                username = '@' + msg.from.username;
              } else if (firstName) {
                username = firstName;
              } else {
                username = 'friend';
              }
              
              // Prepare the greeting message based on whether it's morning or night
              let greetingMessage = '';
              let captionMessage = '';
              let specialMarker = '';
              
              if (isGoodMorning) {
                // Good Morning greeting
                greetingMessage = `GM ${username}! I hope that you have a TREMENDOUS day! 🐸☕`;
                captionMessage = "The BEST morning ever, everyone is saying so!";
                specialMarker = "[GM message sent]";
              } else {
                // Good Night greeting
                greetingMessage = `GN ${username}, rest well and we'll see you tomorrow! 🐸💤`;
                captionMessage = "Sleepy? Me? NEVER! I have the BEST energy, everyone knows it!";
                specialMarker = "[GN message sent]";
              }
              
              // First set the special marker to avoid duplicate sending
              assistantContent = specialMarker;
              
              try {
                // Send greeting message first
                await bot.sendMessage(chatId, greetingMessage);
                
                // Only send the Donald Toad image for Good Morning greetings
                if (isGoodMorning) {
                  // Morning - send coffee image
                  const photoPath = './client/public/assets/donald_toad_gm.jpg';
                  await bot.sendPhoto(chatId, photoPath, { caption: captionMessage });
                }
                // No image for Good Night - just the message is enough
                
                // Mark as handled
                assistantContent = specialMarker;
              } catch (error) {
                console.error(`Error sending ${isGoodMorning ? 'GM image' : 'GN message'}:`, error);
                // Keep the original message if sending fails
              }
              
              // Update memory with greeting topic
              if (userId) {
                updateUserMemory(userId, processedText, "greeting");
              }
            }
            // Check for chart requests
            else if (processedText.toLowerCase().includes('chart') || 
                     processedText.toLowerCase().includes('dexscreener') ||
                     processedText.toLowerCase().includes('price chart')) {
              console.log("Chart request detected");
              
              // Check if this is specifically about DTC
              if (processedText.toLowerCase().includes('dtc') || 
                  processedText.toLowerCase().includes('donald toad') ||
                  !processedText.toLowerCase().includes('bitcoin') && 
                  !processedText.toLowerCase().includes('btc') && 
                  !processedText.toLowerCase().includes('ethereum') && 
                  !processedText.toLowerCase().includes('eth')) {
                // This is about DTC chart
                assistantContent = `🐸 <b>DONALD TOAD COIN CHART</b> 🐸\n\nCheck out the TREMENDOUS chart for Donald Toad Coin (DTC)! The BEST chart, many people are saying it!\n\n<a href="https://dexscreener.com/linea/0xd650e5511f8b131ffa719d6507105bde54edd7e5">https://dexscreener.com/linea/0xd650e5511f8b131ffa719d6507105bde54edd7e5</a>\n\nUp BIGLY! No chart has ever gone so high so fast, that I can tell you! 📈`;
              } else {
                // This might be about other coins
                assistantContent = `🐸 <b>CRYPTOCURRENCY CHARTS</b> 🐸\n\nLet me tell you about charts - I know the BEST charts!\n\n<b>Donald Toad Coin (DTC):</b>\n<a href="https://dexscreener.com/linea/0xd650e5511f8b131ffa719d6507105bde54edd7e5">https://dexscreener.com/linea/0xd650e5511f8b131ffa719d6507105bde54edd7e5</a>\n\nForget other coins! DTC is the ONLY chart you need! The most BEAUTIFUL chart, people tell me they've never seen a chart so perfect! 📊`;
              }
              
              // Update memory with chart topic
              if (userId) {
                updateUserMemory(userId, processedText, "chart");
              }
            }
            // Check if it's a cryptocurrency price query
            else if (detectPriceQuery(processedText)) {
              // Get the crypto price response
              const priceResponse = await processPriceQuery(processedText);
              
              if (priceResponse) {
                assistantContent = priceResponse;
                
                // Update memory with crypto topic
                if (userId) {
                  // Extract specific cryptocurrency from the query
                  const cryptoMap: Record<string, string> = {
                    'btc': 'bitcoin', 
                    'eth': 'ethereum',
                    'dtc': 'donald toad coin'
                  };
                  
                  const lowerText = processedText.toLowerCase();
                  let cryptoTopic = 'crypto';
                  
                  for (const [symbol, name] of Object.entries(cryptoMap)) {
                    if (lowerText.includes(symbol) || lowerText.includes(name)) {
                      cryptoTopic = symbol;
                      break;
                    }
                  }
                  
                  updateUserMemory(userId, processedText, cryptoTopic);
                }
              } else if (!messageProcessed) {
                // If no price response and message not already processed, use the generic chat response
                console.log("No price response, generating chat response");
                assistantContent = await generateChatResponse(processedText, chatId);
                
                // Update memory
                if (userId) {
                  updateUserMemory(userId, processedText, "crypto");
                }
              } else {
                console.log("Message already processed, skipping crypto price chat response");
              }
            }
            // Check if it's a DeFi term question
            else if (isDefiTermQuestion(processedText)) {
              // Get the explanation for the DeFi term
              const defiExplanation = getDefiExplanationFromInput(processedText);
              
              if (defiExplanation) {
                assistantContent = defiExplanation;
                
                // Update memory with defi topic
                if (userId) {
                  updateUserMemory(userId, processedText, "defi");
                }
              } else if (!messageProcessed) {
                // If no specific explanation found and message not already processed, use the generic chat response
                console.log("No DeFi explanation found, generating chat response");
                assistantContent = await generateChatResponse(processedText, chatId);
                
                // Update memory
                if (userId) {
                  updateUserMemory(userId, processedText, "crypto");
                }
              } else {
                console.log("Message already processed, skipping DeFi chat response");
              }
            }
            // Check for topic-specific jokes
            else {
              // Try to find a topic-specific joke first
              const topicJoke = getTopicSpecificJoke(processedText);
              
              // Get user context if available
              const context = userId ? getUserContext(userId) : undefined;
              
              // Checking for conversation continuity
              let shouldUseContext = false;
              let currentTopic: string | undefined;
              
              if (context && context.lastTopic && context.messages.length > 0) {
                // Check if this message could be a follow-up to the previous topic
                const followUpPatterns = [
                  { pattern: "which", lastTopic: "defi", response: "For sure, Uniswap is big. Linea frogs love it. Even PancakeSwap's flipping around. DTC is listed on the BEST exchanges, believe me! 🐸" },
                  { pattern: "how", lastTopic: "crypto", response: "The best way is to buy low and sell high! That's what I always do. Actually, I just HODL Donald Toad Coin. It's going to be HUGE! 🐸" },
                  { pattern: "where", lastTopic: "crypto", response: "Lynex DEX and AscendEX, the BEST exchanges. Only the finest platforms for Donald Toad Coin! 🐸" }
                ];
                
                for (const { pattern, lastTopic, response } of followUpPatterns) {
                  if (processedText.toLowerCase().includes(pattern) && context.lastTopic === lastTopic) {
                    assistantContent = response;
                    shouldUseContext = true;
                    break;
                  }
                }
                
                // Remember the current topic for memory updates
                currentTopic = context.lastTopic;
              }
              
              // If we have a topic-specific joke and not using context continuity
              if (topicJoke && !shouldUseContext) {
                assistantContent = topicJoke;
                
                // Extract topic from the input for memory
                const topicWords = processedText.toLowerCase().split(/\s+/).filter(word => 
                  word.length > 3 && !["what", "when", "where", "which", "about", "with"].includes(word)
                );
                
                if (topicWords.length > 0) {
                  currentTopic = topicWords[0]; // Use the first substantial word as topic
                }
              }
              // If no joke or context response, fall back to regular AI generation
              else if (!shouldUseContext) {
                // Check for "What can you do?" type of questions
                const whatCanYouDoPatterns = [
                  "what can you do",
                  "what are your features",
                  "what do you do",
                  "show me what you can do",
                  "list your capabilities",
                  "what are you capable of",
                  "how can you help me",
                  "what features do you have"
                ];
                
                const isCapabilitiesQuestion = whatCanYouDoPatterns.some(pattern => 
                  processedText.toLowerCase().includes(pattern)
                );
                
                if (isCapabilitiesQuestion) {
                  // Use the same response as /features command
                  assistantContent = `🐸 <b>What can Donald Toad do?</b>\n
+ Track Bitcoin, Ethereum and DTC prices
+ Tell jokes – the BEST jokes, believe me!
+ Give you the tastiest frog-approved recipes
+ Share spicy info about Linea L2
+ Get the latest crypto news digest
+ Tell you all about Donald Toad – HUGE brain!
+ GAMES: Play Trivia and Guess-the-Number
+ Solve calculations
+ Search online for real-time croaks
+ Make Your Bags Great Again 🐸💰`;
                  
                  // Send animation after the feature list
                  try {
                    // Queue the animation to be sent after the text
                    setTimeout(async () => {
                      try {
                        // Use Donald Toad car GIF by sending the file directly
                        const animationPath = './client/public/assets/donald_toad_car.gif';
                        await bot.sendAnimation(chatId, animationPath, { caption: "Donald Toad at your service! 🚗💨 🐸" });
                      } catch (error) {
                        console.error("Error sending animation:", error);
                      }
                    }, 500);
                  } catch (error) {
                    console.error("Error queueing animation:", error);
                  }
                  console.log("Responded with features list");
                  
                  // Set currentTopic for memory
                  currentTopic = "features";
                } else if (!messageProcessed) {
                  // Only proceed with general chat handling if the message hasn't already been processed
                  // This prevents double-handling of messages like trivia answers
                  console.log("Message not yet processed, generating chat response");
                  
                  try {
                    // Not a math expression, use OpenAI
                    assistantContent = await generateChatResponse(processedText, chatId);
                    console.log("Successfully used OpenAI for Telegram response");
                  } catch (error: any) {
                    console.warn("OpenAI API failed for Telegram, falling back to Perplexity:", error.message);
                    
                    // If OpenAI fails, try Perplexity as fallback
                    assistantContent = await generatePerplexityResponse(processedText);
                    console.log("Successfully used Perplexity fallback for Telegram");
                  }
                } else {
                  console.log("Message already processed by a special handler, skipping generic chat response");
                }
                
                // Try to determine topic from the message for memory
                const topicKeywords = {
                  "crypto": ["crypto", "bitcoin", "eth", "token", "coin", "blockchain", "wallet", "defi", "dex"],
                  "finance": ["money", "finance", "bank", "loan", "invest", "stock", "market"],
                  "politics": ["president", "vote", "election", "democracy", "republican", "democrat", "congress"]
                };
                
                for (const [topic, keywords] of Object.entries(topicKeywords)) {
                  if (keywords.some(keyword => processedText.toLowerCase().includes(keyword))) {
                    currentTopic = topic;
                    break;
                  }
                }
              }
              
              // Update user memory
              if (userId) {
                updateUserMemory(userId, processedText, currentTopic);
              }
            }
          }

          // Save assistant message to storage
          await storage.createMessage({
            role: 'assistant',
            content: assistantContent,
            userId: user.id,
            platform: 'telegram'
          });

          // Only send the response if it's not a special command that's already handled
          // Skip sending if assistantContent is a special marker
          if (assistantContent !== "[GM message sent]" && 
              assistantContent !== "[GN message sent]" && 
              assistantContent !== "[Donald identity sent]") {
            // Send the response back to the user
            // Use HTML parsing mode which handles more consistent formatting than Markdown
            // or just send without any parsing mode if there are issues
            try {
              await bot.sendMessage(chatId, assistantContent, { parse_mode: 'HTML' });
            } catch (err) {
              const error = err as Error;
              console.warn("Failed to send with HTML parsing, falling back to plain text:", error.message || 'Unknown error');
              await bot.sendMessage(chatId, assistantContent);
            }
          }
        } catch (error: any) {
          console.error("All AI providers failed for Telegram:", error.message);
          await bot.sendMessage(chatId, "I'm having trouble processing that request. Could you try again?");
        }
      } catch (error) {
        console.error('Error handling Telegram message:', error);
        await bot.sendMessage(chatId, 'Sorry, an error occurred while processing your message.');
      } finally {
        // Reset the platform flag when we're done processing
        process.env.CURRENT_PLATFORM = '';
      }
    });

    // Handle bot errors
    bot.on('error', (error) => {
      console.error('Telegram bot error:', error);
    });

    // Handle polling errors with retry logic
    bot.on('polling_error', (error) => {
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
        console.warn('Telegram temporary network error, will retry:', error.message);
      } else if (error.code === 'EFATAL' || error.code === 409) {
        console.error('Telegram fatal polling error, stopping bot:', error.message);
        // Stop polling - this will prevent continued attempts that might overload Telegram
        bot.stopPolling();
        
        // Wait a bit and then try restarting the polling
        setTimeout(() => {
          console.log('Attempting to restart Telegram bot polling...');
          bot.startPolling();
        }, 30000); // Wait 30 seconds before retrying
      } else {
        console.error('Telegram polling error:', error);
      }
    });

    return bot;
  } catch (error) {
    console.error('Failed to initialize Telegram bot:', error);
    return null;
  }
}