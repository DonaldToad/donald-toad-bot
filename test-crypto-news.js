import axios from "axios";

async function testCryptoNewsDigest() {
  console.log("Testing Donald Toad's Crypto News Digest feature...");
  
  try {
    // Make API request to get crypto news digest
    console.log("Sending request to /api/chatResponse endpoint...");
    const response = await axios.post("http://localhost:5000/api/chatResponse", {
      message: "What's the latest crypto news?",
      userId: "test-user-news",
    }, {
      headers: {
        "Content-Type": "application/json",
      }
    });
    
    console.log("\nResponse status:", response.status);
    console.log("Response type:", typeof response.data);
    
    if (typeof response.data === 'object') {
      console.log("\nCrypto News Digest Response:\n" + response.data.content);
    } else {
      console.log("\nCrypto News Digest Response (raw):\n", response.data);
    }
    
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Error testing crypto news:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the test
testCryptoNewsDigest();