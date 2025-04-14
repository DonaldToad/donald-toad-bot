/**
 * Donald Toad Math Detector
 * 
 * Instead of trying to solve math problems, we'll provide humorous responses
 * encouraging users to use a calculator
 */

/**
 * Check if a message is likely a math expression or question
 * 
 * @param text The message to check
 * @returns True if the message appears to be math-related
 */
export function isMathExpression(text: string): boolean {
  // Normalize the message to lowercase
  const normalizedText = text.toLowerCase().trim();
  
  console.log("Checking if message is a math problem:", text);
  console.log("Normalized message:", normalizedText);
  
  // CRITICAL FIX: Standalone expressions check - highest priority
  // This catches any standalone math expression like "3*7", "7x8", "5+3", etc.
  if (/^[\s\d\+\-\*\/xX\s\.]+$/.test(normalizedText)) {
    console.log("MATH MATCH! Standalone math expression detected - highest priority");
    return true;
  }
  
  // SPECIAL CASE: Handle exact format for multiplication with 'x' (e.g. "8x7")
  if (/^\s*\d+\s*[xX]\s*\d+\s*$/.test(normalizedText)) {
    console.log("Math pattern detected: exact multiplication expression with 'x'");
    return true;
  }
  
  // SPECIAL CASE: Handle exact format for multiplication with asterisk (e.g. "8*7" or "5*123")
  // Use backslash to properly escape the asterisk in the regex
  if (/^\s*\d+\s*\*\s*\d+\s*$/.test(normalizedText)) {
    console.log("Math pattern detected: exact multiplication expression with asterisk");
    return true;
  }
  
  // Check if this is just two numbers with exact multiplication format
  const multiplicationXMatch = normalizedText.match(/^(\d+)[xX](\d+)$/);
  if (multiplicationXMatch) {
    console.log("Math pattern detected: exact multiplication expression with X");
    return true;
  }
  
  // Check if this is just two numbers with exact multiplication format using asterisk
  const multiplicationStarMatch = normalizedText.match(/^(\d+)\*(\d+)$/);
  if (multiplicationStarMatch) {
    console.log("Math pattern detected: exact multiplication expression with asterisk");
    return true;
  }
  
  // First exclude patterns we know are NOT math
  // These are explicit topic queries that might contain numbers but aren't math problems
  if (/tell me about|what do you know about|talk about|explain to me about/.test(normalizedText)) {
    console.log("Not math: This is a topic query pattern");
    return false;
  }
  
  // Quick check for social media links - these should not be treated as math expressions
  if (/(http|https|www|\.com|\.org|\.net)/.test(normalizedText)) {
    console.log("Not math: Contains URLs or website references");
    return false;
  }
  
  // Direct arithmetic expressions like "5+3" or "10/2" without any additional text
  if (/^\s*\d+\s*[\+\-\*\/]\s*\d+\s*$/.test(normalizedText)) {
    console.log("Math pattern detected: direct arithmetic expression");
    return true;
  }
  
  // Handle "Tell me X-Y" or "Tell me 8x7" pattern specifically
  if (/^tell me\s+\d+\s*[\+\-\*\/xX]\s*\d+$/.test(normalizedText)) {
    console.log("Math pattern detected: tell me with direct expression");
    return true;
  }
  
  // Simple pattern for basic math operations with or without spaces
  // e.g., "5 + 7", "6 * 7", "100 - 31", "5+7", "8x7" (multiplication)
  // BUT only if it's likely the main purpose of the message
  if (/\d+\s*[\+\-\*\/xX]\s*\d+/.test(normalizedText)) {
    // Check if the message appears to be primarily about a math problem
    // Avoid triggering on messages that just happen to contain numbers
    const mathKeywords = ['calculate', 'what is', 'solve', 'computation', 'equals', 'result'];
    for (const keyword of mathKeywords) {
      if (normalizedText.includes(keyword)) {
        console.log("Math pattern detected: keyword with operator");
        return true;
      }
    }
    
    // SPECIAL ENHANCEMENT: Check if the message is short and primarily contains a math expression
    // This helps catch bare expressions like "8x7" or "10/2" without additional context
    if (normalizedText.length < 10) {
      console.log("Math pattern detected: short message with math operation");
      return true;
    }
  }
  
  // Pattern for explicit math questions like "what is 5 + 7" or "calculate 5*7"
  if (/((what|calculate|compute|solve)(\sis)?|equals)\s+\d[\d\s\+\-\*\/xX\^\(\)\.]*\d/i.test(normalizedText)) {
    console.log("Math pattern detected: explicit math question");
    return true;
  }
  
  console.log("Not a math expression");
  return false;
}

/**
 * Extract the math expression from a message
 * 
 * @param text The message containing a math expression
 * @returns The extracted expression or null if none found
 */
export function extractMathExpression(text: string): string | null {
  console.log("Extracting math expression from:", text);
  
  // CRITICAL FIX: Better handling for asterisks
  // Check for direct expression with special care for asterisks
  // First handle specific cases with asterisk to ensure proper extraction
  
  // For multiplications with asterisk, handle specially
  if (/^\s*\d+\s*\*\s*\d+\s*$/.test(text)) {
    const starMatch = text.match(/(\d+)\s*\*\s*(\d+)/);
    if (starMatch) {
      const result = `${starMatch[1]}*${starMatch[2]}`;
      console.log("Found direct multiplication with asterisk:", result);
      return result;
    }
  }
  
  // For standard direct expression like "5 + 7" or "8x7" or "10/2"
  const directMatch = text.match(/\d+\s*[\+\-\*\/xX]\s*\d+/);
  if (directMatch) {
    console.log("Found direct math pattern:", directMatch[0]);
    return directMatch[0];
  }
  
  // Check for patterns like "what is 5 + 7"
  const questionMatch = text.match(/what\s+is\s+(\d+\s*[\+\-\*\/xX]\s*\d+)/i);
  if (questionMatch && questionMatch[1]) {
    console.log("Found 'what is' math pattern:", questionMatch[1]);
    return questionMatch[1];
  }
  
  // Check for "calculate" pattern like "calculate 5*123"
  const calculateMatch = text.match(/calculate\s+(\d+\s*[\+\-\*\/xX]\s*\d+)/i);
  if (calculateMatch && calculateMatch[1]) {
    console.log("Found 'calculate' math pattern:", calculateMatch[1]);
    return calculateMatch[1];
  }
  
  // Check for "tell me" pattern like "tell me 8x7" or "tell me 10/2"
  const tellMeMatch = text.match(/tell\s+me\s+(\d+\s*[\+\-\*\/xX]\s*\d+)/i);
  if (tellMeMatch && tellMeMatch[1]) {
    console.log("Found 'tell me' math pattern:", tellMeMatch[1]);
    return tellMeMatch[1];
  }
  
  // Special handling for direct format "5*123" which might be tricky to match
  const directStarMatch = text.match(/(\d+)\s*\*\s*(\d+)/);
  if (directStarMatch) {
    const fullExpression = `${directStarMatch[1]}*${directStarMatch[2]}`;
    console.log("Found direct star multiplication pattern:", fullExpression);
    return fullExpression;
  }
  
  // Last resort - try to find any math expression in the text
  const anyExpressionMatch = text.match(/(\d+)\s*([\+\-\/xX])\s*(\d+)/);
  if (anyExpressionMatch) {
    const fullExpression = `${anyExpressionMatch[1]}${anyExpressionMatch[2]}${anyExpressionMatch[3]}`;
    console.log("Found general math pattern:", fullExpression);
    return fullExpression;
  }
  
  console.log("No math expression found in message");
  return null;
}

/**
 * Actually solve the math expression and provide a Donald Toad response with the result
 * 
 * @param expression The math expression to solve (e.g., "5+3", "10/2", "8x7")
 * @returns A Donald Toad style response with the calculation result
 */
export function solveMathExpression(expression: string): string {
  console.log("Attempting to solve math expression:", expression);
  
  try {
    // CRITICAL FIX: Make sure we're only handling math expressions
    // This prevents any other text from getting through
    if (!/^[\s\d\+\-\*\/xX\s\.]+$/.test(expression)) {
      console.log("Not a pure math expression, sanitizing...");
      // Try to extract just the math part if possible
      const mathMatch = expression.match(/(\d+)\s*([\+\-\*\/xX])\s*(\d+)/);
      if (mathMatch) {
        expression = mathMatch[0];
        console.log("Sanitized to:", expression);
      } else {
        console.log("Could not sanitize expression, using fallback");
        return getFunnyCalculatorResponse();
      }
    }
    
    // Standardize the expression (replace 'x' or 'X' with '*' for multiplication)
    let standardExpression = expression.replace(/[xX]/g, '*');
    
    // Clean up any spaces
    standardExpression = standardExpression.replace(/\s+/g, '');
    console.log("Standardized expression:", standardExpression);
    
    // Simple expression evaluator for basic operations
    let result: number;
    
    // Try direct evaluation first using Function
    try {
      // Safely evaluate the expression
      // This is safe because we've already verified it only contains math characters
      result = Function(`"use strict"; return (${standardExpression})`)();
      console.log(`Calculated ${standardExpression} = ${result} using direct evaluation`);
    } catch (evalError) {
      console.log("Direct evaluation failed, trying pattern matching");
      
      // Fall back to pattern matching
      if (standardExpression.includes('+')) {
        const [a, b] = standardExpression.split('+').map(Number);
        result = a + b;
        console.log(`Calculated ${a} + ${b} = ${result}`);
      } 
      else if (standardExpression.includes('-')) {
        const [a, b] = standardExpression.split('-').map(Number);
        result = a - b;
        console.log(`Calculated ${a} - ${b} = ${result}`);
      }
      else if (standardExpression.includes('*')) {
        const [a, b] = standardExpression.split('*').map(Number);
        result = a * b;
        console.log(`Calculated ${a} * ${b} = ${result}`);
      }
      else if (standardExpression.includes('/')) {
        const [a, b] = standardExpression.split('/').map(Number);
        if (b === 0) {
          return "Trying to divide by ZERO? That's like trying to build a wall with NO FUNDING! Even I can't make that deal work! Try a different calculation, folks! 🐸";
        }
        result = a / b;
        console.log(`Calculated ${a} / ${b} = ${result}`);
      }
      else {
        // If we can't parse it, fall back to the funny responses
        return getFunnyCalculatorResponse();
      }
    }
    
    // Array of result-specific responses
    const responses = [
      `${expression} = ${result}! I calculated that INSTANTLY! I've got the best brain for numbers, really tremendous calculations! That I can tell you! 🐸`,
      
      `The answer is ${result}! I did that math faster than anyone, believe me! Some people - very smart people - they take calculators everywhere, but I just KNOW these things! 🐸`,
      
      `${expression} equals ${result}! I've always been a MATH GENIUS! My uncle was at MIT, very good genes! I did this calculation in my head - no calculator needed! 🐸`,
      
      `${result} is the answer - calculated it faster than any computer! I'm very good with numbers, the best really. I understand numbers better than anybody! 🐸`
    ];
    
    // Choose a random response that includes the calculation result
    return responses[Math.floor(Math.random() * responses.length)];
  } 
  catch (error) {
    console.error("Error solving math expression:", error);
    // If there's any error in calculation, fall back to the funny responses
    return getFunnyCalculatorResponse();
  }
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
    
    "When I was in school, I was the BEST at math! Teachers were AMAZED! But now I have people for that - very smart people! Maybe try a calculator? They're made in China, sadly, but they work! 🐸",
    
    "EXCUSE ME, but I'm busy running my EMPIRE! For simple math like this, use a calculator! I could answer, but my time is worth BILLIONS! 🐸",
    
    "You know who was great at math? My uncle at MIT - very smart guy, tremendous genes! I'm more of a BIG PICTURE thinker! For small calculations, try a calculator! They're low energy but reliable! 🐸"
  ];
  
  // Choose a random response
  return responses[Math.floor(Math.random() * responses.length)];
}