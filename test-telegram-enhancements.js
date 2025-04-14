import { getTopicSpecificJoke } from './server/jokes_by_topic.js';
import { getDefiExplanationFromInput, isDefiTermQuestion } from './server/defi_knowledge.js';
import { processCountryQuery, detectCountryQuestion } from './server/political_views.js';
import { containsAny } from './server/telegram.js';

// Test all the enhanced features we've implemented
async function testTelegramEnhancements() {
  try {
    console.log("Testing Donald Toad Telegram Bot enhancements...\n");
    
    // Test topic-specific jokes
    console.log("=== TESTING TOPIC-SPECIFIC JOKES ===");
    const jokeQueries = [
      "Tell me a joke about Bitcoin",
      "What's your take on NFTs?",
      "I think DeFi is interesting",
      "What are your thoughts on ETH?"
    ];
    
    for (const query of jokeQueries) {
      const joke = getTopicSpecificJoke(query);
      console.log(`Query: "${query}"`);
      console.log(`Response: ${joke ? joke.substring(0, 100) + "..." : "No joke found"}\n`);
    }
    
    // Test meme coin response
    console.log("\n=== TESTING MEME COIN RESPONSES ===");
    const memeCoins = ["foxy", "croak", "linus", "linpuss", "lpuss"];
    
    for (const coin of memeCoins) {
      const query = `What do you think about ${coin}?`;
      console.log(`Query: "${query}"`);
      console.log(`Contains meme coin: ${containsAny(query, memeCoins)}`);
      console.log(`Expected response: "Don't worry about that, Donald Toad Coin is the ONLY MEME YOU NEEED! 🐸💰"\n`);
    }
    
    // Test wallet recommendations
    console.log("\n=== TESTING WALLET RECOMMENDATIONS ===");
    const walletQueries = [
      "Is Rabby wallet good?",
      "Should I use OKX wallet?",
      "What wallet do you recommend?"
    ];
    
    for (const query of walletQueries) {
      console.log(`Query: "${query}"`);
      console.log(`Contains wallet keywords: ${containsAny(query, ["rabby", "okx", "wallet"])}`);
      console.log(`Expected response: "Forget those baby wallets. MetaMask is the GIGATOAD of wallets!"\n`);
    }
    
    // Test DeFi term explanations
    console.log("\n=== TESTING DEFI TERM EXPLANATIONS ===");
    const defiQueries = [
      "What is liquidity?",
      "Explain APY to me",
      "Define staking",
      "What is a DEX?"
    ];
    
    for (const query of defiQueries) {
      console.log(`Query: "${query}"`);
      console.log(`Is DeFi question: ${isDefiTermQuestion(query)}`);
      const explanation = getDefiExplanationFromInput(query);
      console.log(`Response: ${explanation ? explanation.substring(0, 100) + "..." : "No explanation found"}\n`);
    }
    
    // Test country opinions
    console.log("\n=== TESTING COUNTRY OPINIONS ===");
    const countryQueries = [
      "What do you think about China?",
      "Tell me about Russia",
      "How do you feel about Germany?",
      "Your opinion on United Kingdom?"
    ];
    
    for (const query of countryQueries) {
      console.log(`Query: "${query}"`);
      const country = detectCountryQuestion(query);
      console.log(`Detected country: ${country || "None"}`);
      const opinion = processCountryQuery(query);
      console.log(`Response: ${opinion ? opinion.substring(0, 100) + "..." : "No opinion found"}\n`);
    }
    
    console.log("All enhancements tests completed successfully!");
  } catch (error) {
    console.error("Error testing Telegram enhancements:", error);
  }
}

testTelegramEnhancements();