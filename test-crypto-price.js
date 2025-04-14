// Test script for crypto price functionality
import { getCryptoPrice, formatPriceResponse, detectPriceQuery } from './server/crypto_prices.js';

async function testCryptoPrices() {
  try {
    console.log("===== Testing Crypto Price Functionality =====");
    
    // Test price detection
    const testQueries = [
      "Bitcoin price",
      "BTC price",
      "What's the price of Bitcoin?",
      "eth price",
      "ethereum",
      "DTC price",
      "How much is Donald Toad Coin worth?",
      "Tell me about blockchain" // Not a price query
    ];
    
    console.log("\n1. Testing Price Query Detection:");
    for (const query of testQueries) {
      const symbol = detectPriceQuery(query);
      console.log(`Query: "${query}" -> ${symbol || "Not a price query"}`);
    }
    
    // Test price fetching
    console.log("\n2. Testing Price Fetching:");
    try {
      const btcPrice = await getCryptoPrice('btc');
      console.log(`Bitcoin price: $${btcPrice}`);
      
      const ethPrice = await getCryptoPrice('eth');
      console.log(`Ethereum price: $${ethPrice}`);
      
      const dtcPrice = await getCryptoPrice('dtc');
      console.log(`DTC price: $${dtcPrice}`);
    } catch (error) {
      console.error("Error fetching prices:", error.message);
    }
    
    // Test response formatting
    console.log("\n3. Testing Response Formatting:");
    const formattedBTC = formatPriceResponse('btc', '69,420');
    console.log("Bitcoin response:");
    console.log(formattedBTC);
    
    const formattedETH = formatPriceResponse('eth', '4,200');
    console.log("\nEthereum response:");
    console.log(formattedETH);
    
    const formattedDTC = formatPriceResponse('dtc', '1.337');
    console.log("\nDTC response:");
    console.log(formattedDTC);
    
    console.log("\n===== Test Complete =====");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testCryptoPrices();