// Create a standalone function for testing
function isRequestingCryptoNews(message) {
  if (!message) return false;
  
  const lowerText = message.toLowerCase().trim();
  
  // Check for direct news commands
  if (lowerText === '/news' || lowerText === '/cryptonews') {
    return true;
  }
  
  const newsPatterns = [
    'crypto news',
    'latest news',
    'news digest',
    'what\'s happening',
    'what is happening',
    'market news',
    'bitcoin news',
    'ethereum news',
    'blockchain news',
    'defi news',
    'nft news',
    'altcoin news',
    'news update',
    'crypto update',
    'market update',
    'tell me news',
    'tell me the news',
    'show me news',
    'show me the news',
    'get me news',
    'get me the news'
  ];
  
  // Add more variations and question forms
  const questionPatterns = [
    'what\'s new',
    'what is new',
    'what\'s going on',
    'what is going on',
    'any news',
    'tell me about the market',
    'how is the market',
    'how\'s the market',
    'anything new',
    'headlines',
    'what happened today',
    'what\'s happening today',
    'what happened in crypto',
    'crypto headlines',
    'tell me about the crypto market'
  ];
  
  return newsPatterns.some(pattern => lowerText.includes(pattern)) ||
         questionPatterns.some(pattern => lowerText.includes(pattern));
}

// Test function for news detection
function testNewsDetection() {
  console.log("Testing Crypto News Detection Patterns");
  console.log("=====================================");
  
  const testMessages = [
    // Direct commands
    '/news',
    '/cryptonews',
    
    // Basic news requests
    'crypto news',
    'latest news',
    'news digest',
    'What\'s happening in crypto?',
    'Tell me market news',
    'Show me bitcoin news',
    'Any ethereum news?',
    'Blockchain news',
    'DeFi news updates please',
    'NFT news',
    'Altcoin news today',
    'Crypto update',
    'Market update',
    
    // Question forms
    'What\'s new in crypto?',
    'What is new in the markets?',
    'What\'s going on with Bitcoin?',
    'What is going on with Ethereum?',
    'Any news about crypto today?',
    'Tell me about the crypto market',
    'How is the market doing?',
    'How\'s the market today?',
    'Anything new with DTC?',
    'What are the headlines today?',
    'What happened in crypto today?',
    'Any crypto headlines?',
    
    // Variations
    'Tell me news about crypto',
    'Show me the news in defi',
    'Get me news on nfts',
    'Donald, what\'s new in the crypto world?',
    'Hey, any crypto updates?',
    
    // Non-news messages (should return false)
    'What is Bitcoin?',
    'How does Ethereum work?',
    'DTC price',
    'Tell me a joke',
    'What do you think about the economy?',
    '123 + 456',
    'Hello',
    'Goodbye',
    ''
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  // Expected results for each test message
  const expectedResults = [
    true, true, // Direct commands
    true, true, true, true, true, true, true, true, true, true, true, true, true, // Basic news
    true, true, true, true, true, true, true, true, true, true, true, true, // Questions
    true, true, true, true, true, // Variations
    false, false, false, false, false, false, false, false, false // Non-news
  ];
  
  // Run tests
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    const expected = expectedResults[i];
    const result = isRequestingCryptoNews(message);
    
    if (result === expected) {
      console.log(`✅ "${message}" - Correct! (${result})`);
      passedTests++;
    } else {
      console.log(`❌ "${message}" - FAILED! Expected: ${expected}, Got: ${result}`);
      failedTests++;
    }
  }
  
  // Summary
  console.log("\nTEST SUMMARY:");
  console.log(`Total tests: ${testMessages.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success rate: ${(passedTests / testMessages.length * 100).toFixed(2)}%`);
}

// Run the test
testNewsDetection();