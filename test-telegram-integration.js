import { isDirectMathExpression, solveMathExpression } from './server/math-fixed.js';
import { isTriviaRequest, startTriviaGame, processTriviaAnswer } from './server/crypto_trivia.js';
import { storage } from './server/storage.js';

// Test the Telegram integration
async function testTelegramIntegration() {
  try {
    console.log("Testing Telegram integration...");
    
    // Create a test user if not exists
    let testUser = await storage.getUserByUsername("telegram_test_user");
    if (!testUser) {
      testUser = await storage.createUser({
        username: "telegram_test_user",
        password: "test123",
        telegramChatId: "123456789",
        platform: "telegram"
      });
      console.log("Created test user:", testUser);
    }
    
    // Test math detection and calculation
    const mathTestCases = ["5+7", "10*3", "what is 9/3"];
    
    console.log("\nTesting math functionality in Telegram context:");
    for (const testCase of mathTestCases) {
      console.log(`\nTest expression: "${testCase}"`);
      const isMath = isDirectMathExpression(testCase);
      console.log(`Is math expression: ${isMath}`);
      
      if (isMath) {
        const result = solveMathExpression(testCase);
        console.log(`Result: ${result}`);
      }
    }
    
    // Test trivia detection and game flow
    console.log("\nTesting trivia functionality in Telegram context:");
    
    // Test trivia detection
    const triviaRequest = "trivia";
    const isTrivia = isTriviaRequest(triviaRequest);
    console.log(`\nTrivia request "${triviaRequest}" detected: ${isTrivia}`);
    
    if (isTrivia) {
      console.log("\nStarting trivia game...");
      const gameResult = await startTriviaGame(testUser.id);
      console.log("Game started with response:", gameResult.response.substring(0, 100) + "...");
      
      // Get the active game
      const activeGame = await storage.getGameByType(testUser.id, 'trivia');
      if (activeGame) {
        console.log("Game state stored successfully");
        
        // Test answering with option 1
        console.log("\nSimulating answer with option 1...");
        const answerResult = await processTriviaAnswer(testUser.id, "1", activeGame);
        console.log("Answer response:", answerResult.substring(0, 100) + "...");
        
        // End the game
        await storage.endAllGames(testUser.id);
        console.log("\nGame ended successfully");
      } else {
        console.error("Failed to retrieve active game state");
      }
    }
    
    console.log("\nTelegram integration test completed successfully!");
  } catch (error) {
    console.error("Error testing Telegram integration:", error);
  }
}

testTelegramIntegration();