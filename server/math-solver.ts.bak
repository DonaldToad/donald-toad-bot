/**
 * Math problem solver for Donald Toad AI
 * 
 * This module provides mathematical capabilities to the Donald Toad AI,
 * allowing it to detect and solve basic math problems in user messages.
 */

/**
 * Solves a mathematical problem and returns a Donald Toad style response
 * Handles basic arithmetic operations including addition, subtraction, multiplication, and division
 * Can handle expressions with or without spaces
 * 
 * @param message The user's message containing a math problem
 * @returns A Donald Toad style response with the solution, or null if no math problem is detected
 */
export function solveMathProblem(message: string): string | null {
  console.log("Attempting to solve math problem:", message);
  
  // First attempt: look for patterns like "5 + 7" or "6 * 7" or "8 x 7" with spaces
  let expression = '';
  const spacedOperatorPattern = /(\d+)\s*([\+\-\*\/xX])\s*(\d+)/;
  const spacedMatch = message.match(spacedOperatorPattern);
  
  if (spacedMatch) {
    console.log("Found spaced operator pattern:", spacedMatch);
    
    // Convert 'x' or 'X' to '*' for JavaScript evaluation
    let operator = spacedMatch[2];
    if (operator.toLowerCase() === 'x') {
      operator = '*';
    }
    
    expression = `${spacedMatch[1]}${operator}${spacedMatch[3]}`;
    console.log("Extracted expression:", expression);
  } else {
    // Second attempt: Clean up the message to extract the math expression
    const expressionMatches = message.match(/[\d\+\-\*\/xX\^\(\)\.\s]+/g);
    console.log("Expression matches:", expressionMatches);
    
    if (!expressionMatches || expressionMatches.length === 0) {
      console.log("No expression matches found");
      return null;
    }
    
    // Join all matched parts and remove spaces
    expression = expressionMatches.join('').replace(/\s+/g, '');
    
    // Replace 'x' or 'X' with '*' for JavaScript evaluation
    expression = expression.replace(/[xX]/g, '*');
    console.log("Processed expression:", expression);
  }
  
  // Check if the expression actually contains any operators and numbers
  if (!/[\d\+\-\*\/\^]/.test(expression)) {
    console.log("Expression doesn't contain operators and numbers");
    return null;
  }
  
  try {
    console.log("Evaluating expression:", expression);
    // Evaluate the expression safely by using Function (instead of eval)
    // This is still safe because we've carefully filtered the input to only include math expressions
    const result = new Function('return ' + expression)();
    console.log("Result:", result);
    
    // Get random phrases to add to the response
    const toadPhrases = [
      "Believe me, folks!",
      "That I can tell you!",
      "Many people are saying it!",
      "Everyone knows it!",
      "That's what they tell me!",
      "I'm the best at math, the absolute best!"
    ];
    
    const boastPhrases = [
      "I solve math faster than anyone, even those so-called 'mathematicians'!",
      "I've always had a natural talent for calculations - it's in my genes!",
      "I've got the best brain for numbers, really tremendous calculations!",
      "My uncle was a professor at MIT, very smart genes!",
      "I could have been a mathematician, but politics needed me more!",
      "I do math in my head all the time, calculating big deals, huge numbers!"
    ];
    
    const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
    const randomBoast = boastPhrases[Math.floor(Math.random() * boastPhrases.length)];
    
    // Format the result nicely, handling integers vs floating point
    const formattedResult = Number.isInteger(result) ? result : result.toFixed(2);
    
    console.log("Formatted result:", formattedResult);
    
    // Construct a Donald Toad style response
    return `${expression} = ${formattedResult}! I calculated that INSTANTLY! ${randomBoast} ${randomPhrase} 🐸`;
  } catch (error) {
    console.error("Math evaluation error:", error);
    return "That math problem is too complicated even for my TREMENDOUS brain! I prefer HUGE deals over TINY calculations! Maybe check your question? 🐸";
  }
}

/**
 * Checks if a message contains a mathematical problem
 * Looks for patterns like "2+2", "what is 5*7", etc.
 * 
 * @param message The user's message to check
 * @returns True if the message contains a math problem
 */
export function isMathProblem(message: string): boolean {
  // Normalize the message - remove punctuation and convert to lowercase
  const normalizedMessage = message.toLowerCase().replace(/[?!.,]/g, '');
  
  console.log("Checking if message is a math problem:", message);
  console.log("Normalized message:", normalizedMessage);
  
  // Simple expressions like "2+2" or "5*7" or "8x7" directly in the message
  if (/\d[\+\-\*\/\^xX]\d/.test(normalizedMessage)) {
    console.log("Math pattern detected: simple expression with operators");
    return true;
  }
  
  // Queries like "what is 2+2" or "calculate 5*7" or "what is 8x7"
  if (/((what|calculate|compute|solve|how much)(\sis)?|equals)\s+\d[\d\s\+\-\*\/\^xX\(\)\.]*\d/.test(normalizedMessage)) {
    console.log("Math pattern detected: query with math keywords");
    return true;
  }
  
  // More basic direct patterns - simple whitespace-separated expressions like "5 + 7" or "8 x 7"
  if (/\d+\s*[\+\-\*\/xX]\s*\d+/.test(normalizedMessage)) {
    console.log("Math pattern detected: simple expression with whitespace");
    return true;
  }
  
  // Special "Tell me" pattern which is commonly used (e.g., "Tell me 8x7" or "Tell me 7x8")
  // This is a high-priority pattern that needs to be handled first to avoid conflicts
  if (/tell\s+me\s+\d+\s*[\+\-\*\/xX]\s*\d+/i.test(normalizedMessage)) {
    console.log("Math pattern detected: 'tell me' expression");
    return true;
  }
  
  // Explicit check for multiplication with 'x' (e.g., "7x8" or "8x7")
  if (/\b\d+\s*[xX]\s*\d+\b/i.test(normalizedMessage)) {
    console.log("Math pattern detected: explicit multiplication with 'x'");
    return true;
  }
  
  // Expressions with written words like "two plus two" or "five times seven"
  const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const operatorWords = ['plus', 'minus', 'times', 'multiplied by', 'divided by'];
  
  for (const numWord of numberWords) {
    for (const opWord of operatorWords) {
      if (normalizedMessage.includes(`${numWord} ${opWord}`)) {
        console.log("Math pattern detected: word-based expression");
        return true;
      }
    }
  }
  
  console.log("No math patterns detected in message");
  return false;
}