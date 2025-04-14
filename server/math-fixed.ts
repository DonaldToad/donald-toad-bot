/**
 * Donald Toad Math Calculator - Simplified Version
 * 
 * This module provides math calculation capabilities to the Donald Toad AI
 * with simplified detection and processing to avoid conflicts with other modules.
 */

/**
 * Check if a message is a direct math expression
 * This uses a more flexible pattern to match various math expressions
 * 
 * @param text The message to check
 * @returns True if the message appears to be a math calculation
 */
export function isDirectMathExpression(text: string): boolean {
  // Debug logging for all inputs
  console.log("MATH DETECT: Checking input:", text);
  
  // If it's a "play guess the number" command, don't treat it as math
  if (/play\s+guess\s+the\s+number/i.test(text)) {
    console.log("MATH DETECT: Found 'play guess the number' command, NOT treating as math");
    return false;
  }
  
  // If it's a "guess the number" game guess, don't treat it as math
  if (/^guess\s+\d+$/i.test(text)) {
    console.log("MATH DETECT: Found 'guess NUMBER' format, NOT treating as math");
    return false;
  }
  
  // IMPROVED APPROACH: More accurate detection for simple math expressions
  // Trim and normalize the input for more reliable checks but preserve original for logging
  const cleanedText = text.trim().replace(/\s+/g, '');
  
  // Specific pattern for simple arithmetic expressions
  // This catches formats like "5+3", "10-2", "6*4", "8/2", "5x10"
  // Also matches "10 * 5", "2 - 7" with spaces between numbers and operator
  const isSimpleArithmetic = /^-?\d+\s*[\+\-\*\/xX]\s*-?\d+$/.test(cleanedText);
  
  if (isSimpleArithmetic) {
    console.log(`MATH DETECT: Found simple arithmetic in: ${text}`);
    return true;
  }
  
  // If not a simple expression, look for any obvious math pattern
  if (/[\+\-\*\/xX]/.test(text)) {
    console.log("MATH DETECT: Found math operator in:", text);
    
    // Check if there are numbers on both sides of any operator
    const hasMathStructure = /\d+\s*[\+\-\*\/xX]\s*\d+/.test(text);
    if (hasMathStructure) {
      console.log(`MATH DETECT: Found math pattern in: ${text}`);
      return true;
    }
  }
  
  // If it's just a single number (likely a guess for the number game), don't treat as math
  if (/^\s*\d+\s*$/.test(text)) {
    console.log("MATH DETECT: Found single number format, NOT treating as math");
    return false;
  }
  
  // No math detected
  console.log("MATH DETECT: No math patterns found in:", text);
  return false;
}

/**
 * Solve a math expression and provide a Donald Toad style response
 * 
 * @param expression The math expression to solve (e.g., "5+3", "10/2", "8x7")
 * @returns A Donald Toad style response with the calculation result
 */
export function solveMathExpression(expression: string): string {
  console.log("MATH-FIXED: Attempting to solve math expression:", expression);
  
  try {
    // Clean up the expression - remove whitespace and normalize
    // Replace "x" or "X" with "*" for proper evaluation
    const normalized = expression.trim()
      .replace(/\s+/g, '')
      .replace(/[xX]/g, '*');
    
    console.log("MATH-FIXED: Normalized expression:", normalized);

    // Handle special cases like single digits first
    if (/^\d+$/.test(normalized)) {
      console.log("MATH-FIXED: This is just a single number, not a calculation");
      return getFunnyCalculatorResponse();
    }
    
    // IMPROVED APPROACH: Better pattern matching for operators and numbers
    // This handles formats like "5+3", "123-45", "5*8", "10/2", "5*10", and negative numbers
    const simpleMatch = normalized.match(/^(-?\d+)([\+\-\*\/])(-?\d+)$/);
    
    if (simpleMatch) {
      const [_, num1Str, operator, num2Str] = simpleMatch;
      // Use parseFloat instead of parseInt to handle decimal values
      const num1 = parseFloat(num1Str);
      const num2 = parseFloat(num2Str);
      
      console.log(`MATH-FIXED: Extracted: ${num1} ${operator} ${num2}`);
      return calculateAndRespond(num1, operator, num2);
    }
    
    // For expressions that don't match the simple pattern
    // Try a more flexible approach to extract the first two numbers and the first operator
    const numbers = normalized.match(/-?\d+(\.\d+)?/g) || [];
    const operators = normalized.match(/[\+\-\*\/]/g) || [];
    
    if (numbers.length >= 2 && operators.length >= 1) {
      // Make sure we have valid values and handle potential undefined
      const num1 = parseFloat(numbers[0] || '0');
      const num2 = parseFloat(numbers[1] || '0');
      const operator = operators[0] || '+';
      
      console.log(`MATH-FIXED: Extracted from complex format: ${num1} ${operator} ${num2}`);
      return calculateAndRespond(num1, operator, num2);
    }
    
    // If we still can't parse it, give up with a funny response
    console.log("MATH-FIXED: Failed to parse expression:", normalized);
    return getFunnyCalculatorResponse();
  } 
  catch (error) {
    console.error("MATH-FIXED: Error solving math expression:", error);
    return getFunnyCalculatorResponse();
  }
}

/**
 * Helper function to calculate a result and format a response
 */
function calculateAndRespond(num1: number, operator: string, num2: number): string {
  let result: number;
  let opSymbol = operator;
  
  // Perform the calculation based on the operator
  if (operator === '+') {
    result = num1 + num2;
  } 
  else if (operator === '-') {
    result = num1 - num2;
  }
  else if (operator === '*' || operator.toLowerCase() === 'x') {
    result = num1 * num2;
    opSymbol = '*'; // Standardize for display
  }
  else if (operator === '/') {
    if (num2 === 0) {
      return "Even I can't divide by ZERO, folks! That's like trying to build a wall with NO FUNDING! Try a different calculation! 🐸";
    }
    result = num1 / num2;
  }
  else {
    console.log("MATH-FIXED: Unsupported operator:", operator);
    return getFunnyCalculatorResponse();
  }
  
  // Format the result - round to 2 decimal places for cleaner display
  const formattedResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(2));
  
  console.log(`MATH-FIXED: Calculated ${num1} ${opSymbol} ${num2} = ${formattedResult}`);
  
  // Format the expression nicely for display
  const prettyExpression = `${num1} ${opSymbol} ${num2}`;
  
  // Array of result-specific responses
  const responses = [
    `${prettyExpression} = ${formattedResult}! I calculated that INSTANTLY! I've got the best brain for numbers, really tremendous calculations! That I can tell you! 🐸`,
    
    `The answer is ${formattedResult}! I did that math faster than anyone, believe me! Some people - very smart people - they take calculators everywhere, but I just KNOW these things! 🐸`,
    
    `${prettyExpression} equals ${formattedResult}! I've always been a MATH GENIUS! My uncle was at MIT, very good genes! I did this calculation in my head - no calculator needed! 🐸`,
    
    `${formattedResult} is the answer - calculated it faster than any computer! I'm very good with numbers, the best really. I understand numbers better than anybody! 🐸`
  ];
  
  // Choose a random response
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Get a funny Donald Toad response about calculators (fallback when calculation fails)
 * 
 * @returns A humor-based calculator response without any calculation
 */
function getFunnyCalculatorResponse(): string {
  // Array of funny calculator-suggesting responses
  const responses = [
    "Look, I'm a DEAL MAKER, not a CALCULATOR! I have people for math - the best people! Use your calculator app, I guarantee it doesn't have a brain as BIG as mine! 🐸",
    
    "I'm too busy making America great again to do your homework! I could solve it - I'd solve it better than anyone - but I delegate math to LOSERS who sit in tiny cubicles all day! Try a calculator! 🐸",
    
    "Math? I've done some of the BIGGEST math deals in history! Tremendous calculations! But a true leader delegates - try your calculator app, it's unemployed and needs the work! 🐸",
    
    "When I was in school, I was the BEST at math! Teachers were AMAZED! But now I have people for that - very smart people! Maybe try a calculator? They're made in China, sadly, but they work! 🐸"
  ];
  
  // Choose a random response
  return responses[Math.floor(Math.random() * responses.length)];
}