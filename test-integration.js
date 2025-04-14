// Test script for the Donald Toad Telegram bot enhancements
import { detectPriceQuery, formatPriceResponse } from './server/crypto_prices.js';
import { isDefiTermQuestion, getDefiExplanationFromInput } from './server/defi_knowledge.js';
import { processCountryQuery } from './server/political_views.js';
import { getTopicSpecificJoke } from './server/jokes_by_topic.js';

async function testDonaldToadFeatures() {
  console.log("===== Testing Donald Toad Bot Features =====\n");
  
  // Test wallet recommendation
  console.log("1. Testing Wallet Recommendation:");
  const walletQueries = [
    "What wallet should I use?",
    "Is MetaMask good?",
    "Recommend a wallet for DTC"
  ];
  console.log("Expected response: For wallets, I recommend MetaMask! MetaMask is the wallet that lets you swim into Ethereum's pond. Croak! 🐸");
  console.log("Check it out: https://metamask.io I have the best words, tremendous vocabulary - my uncle was a professor at MIT! 🐸\n");
  
  // Test cryptocurrency price queries
  console.log("2. Testing Cryptocurrency Price Queries:");
  const priceQueries = [
    "What's the bitcoin price?",
    "ETH price",
    "How much is DTC?"
  ];
  
  for (const query of priceQueries) {
    const symbol = detectPriceQuery(query);
    if (symbol) {
      console.log(`Query: "${query}" -> Detected as price query for ${symbol}`);
      console.log(`Response sample: ${formatPriceResponse(symbol, symbol === 'btc' ? '69,420' : symbol === 'eth' ? '4,200' : '1.337')}`);
      console.log();
    }
  }
  
  // Test DeFi term explanations
  console.log("3. Testing DeFi Term Explanations:");
  const defiQueries = [
    "What is liquidity?",
    "Explain staking",
    "Tell me about yield farming"
  ];
  
  for (const query of defiQueries) {
    if (isDefiTermQuestion(query)) {
      const explanation = getDefiExplanationFromInput(query);
      console.log(`Query: "${query}"`);
      if (explanation) {
        console.log(`Response: ${explanation.substring(0, 100)}...`);
      } else {
        console.log("No specific explanation found.");
      }
      console.log();
    }
  }
  
  // Test country opinions
  console.log("4. Testing Country Opinions:");
  const countryQueries = [
    "What do you think about China?",
    "Tell me about Russia",
    "Your opinion on the United Kingdom"
  ];
  
  for (const query of countryQueries) {
    const opinion = processCountryQuery(query);
    console.log(`Query: "${query}"`);
    if (opinion) {
      console.log(`Response: ${opinion.substring(0, 100)}...`);
    } else {
      console.log("No specific opinion found.");
    }
    console.log();
  }
  
  // Test joke responses
  console.log("5. Testing Topic-Specific Jokes:");
  const jokeQueries = [
    "Tell me a joke about crypto",
    "Joke about politics",
    "Make me laugh about DeFi"
  ];
  
  for (const query of jokeQueries) {
    const joke = getTopicSpecificJoke(query);
    console.log(`Query: "${query}"`);
    if (joke) {
      console.log(`Response: ${joke}`);
    } else {
      console.log("No specific joke found.");
    }
    console.log();
  }
  
  console.log("===== Testing Complete =====");
}

testDonaldToadFeatures();