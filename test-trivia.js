import { startTriviaGame, processTriviaAnswer } from './server/crypto_trivia.js';
import { storage } from './server/storage.js';

// Test the crypto trivia game
async function testTrivia() {
  try {
    console.log("Testing crypto trivia game...");
    
    // Create a test user if not exists
    let testUser = await storage.getUserByUsername("test_user");
    if (!testUser) {
      testUser = await storage.createUser({
        username: "test_user",
        password: "test123",
        platform: "test"
      });
      console.log("Created test user:", testUser);
    }
    
    // Start a new trivia game for the test user
    const startResult = await startTriviaGame(testUser.id);
    console.log("Game started:", startResult);
    
    // Get the active game
    const activeGame = await storage.getGameByType(testUser.id, 'trivia');
    if (!activeGame) {
      console.log("ERROR: No active game found after starting trivia");
      return;
    }
    
    // Simulate answering the question with A
    console.log("Simulating answer 'A'...");
    const answerResult = await processTriviaAnswer(testUser.id, "A", activeGame);
    console.log("Answer result:", answerResult);
    
    console.log("Trivia game test completed successfully!");
  } catch (error) {
    console.error("Error testing trivia game:", error);
  }
}

testTrivia();