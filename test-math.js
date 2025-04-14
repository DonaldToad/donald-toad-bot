import { isDirectMathExpression, solveMathExpression } from './server/math-fixed.js';

// Test the math functionality
async function testMath() {
  try {
    console.log("Testing math functionality...");
    
    // Test cases
    const testCases = [
      "5+7",
      "100/20", 
      "123*5",
      "10-3",
      "guess 5", // should not be detected as math
      "play guess the number", // should not be detected as math
      "tell me about tariffs" // should not be detected as math
    ];
    
    // Run each test case
    for (const testCase of testCases) {
      console.log(`\nTesting: "${testCase}"`);
      
      // Check if it's detected as a math expression
      const isMath = isDirectMathExpression(testCase);
      console.log(`Is math expression: ${isMath}`);
      
      // If it's a math expression, solve it
      if (isMath) {
        const result = solveMathExpression(testCase);
        console.log(`Result: ${result}`);
      }
    }
    
    console.log("\nMath test completed successfully!");
  } catch (error) {
    console.error("Error testing math functionality:", error);
  }
}

testMath();