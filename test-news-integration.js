import axios from 'axios';

/**
 * Tests the Personalized Crypto News Digest feature
 * through the chatResponse API endpoint
 */
async function testNewsIntegration() {
  console.log("Testing Donald Toad's Personalized Crypto News Digest Integration");
  console.log("============================================================");
  
  const testMessages = [
    {
      userId: "test-user-1",
      message: "What's the latest crypto news?"
    },
    {
      userId: "test-user-2", 
      message: "Tell me about the crypto market"
    },
    {
      userId: "test-user-3",
      message: "Any headlines in crypto today?"
    },
    {
      userId: "test-user-4",
      message: "/news"
    }
  ];
  
  // Run tests sequentially
  for (const test of testMessages) {
    try {
      console.log(`\nTesting message: "${test.message}" from user ${test.userId}`);
      
      const response = await axios.post("http://localhost:5000/api/chatResponse", {
        message: test.message,
        userId: test.userId
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (response.status === 200) {
        console.log("✅ Response received successfully!");
        
        if (typeof response.data === 'object' && response.data.content) {
          // Check if the response contains news digest markers
          const content = response.data.content;
          if (content.includes("DONALD TOAD'S CRYPTO NEWS DIGEST") && 
              content.includes("TOP HEADLINES:")) {
            console.log("✅ Response contains proper news digest formatting");
            
            // Print first few lines of response
            const preview = content.split('\n').slice(0, 4).join('\n');
            console.log(`\nPreview: ${preview}... [truncated]`);
          } else {
            console.log("❌ Response doesn't contain expected news digest format");
            console.log("Content:", content);
          }
        } else {
          console.log("❌ Response format is incorrect");
          console.log("Response:", response.data);
        }
      } else {
        console.log(`❌ Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error testing message "${test.message}":`, error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
    }
  }
  
  console.log("\nTest completed!");
}

// Run the test
testNewsIntegration();