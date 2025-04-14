// Need to do module conversion to CommonJS for the test
const crypto_prices = require('./server/crypto_prices');
const { detectPriceQuery, processPriceQuery } = crypto_prices;

async function testBitcoinChatMessage() {
  try {
    console.log("===== Testing Bitcoin Price Detection =====");
    
    const testMessages = [
      "What's the bitcoin price?",
      "BTC price",
      "bitcoin",
      "Tell me about bitcoin",
      "How much is bitcoin worth?",
      "eth price",
      "DTC price"
    ];
    
    console.log("\nPrice Query Detection:");
    for (const message of testMessages) {
      const isPriceQuery = detectPriceQuery(message);
      console.log(`"${message}" -> ${isPriceQuery ? `Price query for ${isPriceQuery}` : "Not a price query"}`);
    }
    
    console.log("\nPrice Response Generation:");
    
    // Test Bitcoin price
    const btcResponse = await processPriceQuery("What's the bitcoin price?");
    console.log("\nBitcoin query response:");
    console.log(btcResponse);
    
    // Test ETH price
    const ethResponse = await processPriceQuery("ETH price");
    console.log("\nEthereum query response:");
    console.log(ethResponse);
    
    // Test DTC price
    const dtcResponse = await processPriceQuery("What's the DTC price?");
    console.log("\nDTC query response:");
    console.log(dtcResponse);
    
    console.log("\n===== Test Complete =====");
  } catch (error) {
    console.error("Error in test:", error);
  }
}

testBitcoinChatMessage();