import { generateChatResponse } from './server/openai.js';

// Test the OpenAI response function (used by Telegram)
async function testTelegramResponse() {
  try {
    console.log("Testing Telegram response...");
    
    // Set the current platform to telegram for context
    process.env.CURRENT_PLATFORM = 'telegram';
    
    // Use a test chat ID
    const chatId = '12345';
    
    // Simple message
    const message = "Tell me about Donald Toad Coin";
    
    // Get response
    console.log(`Sending message: "${message}"`);
    const response = await generateChatResponse(message, chatId);
    
    console.log("\nResponse:");
    console.log(response);
    
    console.log("\nTelegram response test completed!");
  } catch (error) {
    console.error("Error testing Telegram response:", error);
  } finally {
    // Reset platform flag
    process.env.CURRENT_PLATFORM = '';
  }
}

testTelegramResponse();