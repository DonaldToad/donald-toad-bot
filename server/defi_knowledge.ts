import fs from 'fs';
import path from 'path';

// Define the structure of the DeFi knowledge base
interface DeFiKnowledge {
  [term: string]: string;
}

// Load the DeFi knowledge base
let defiKnowledge: DeFiKnowledge;
try {
  const defiData = fs.readFileSync(path.join(process.cwd(), 'server', 'defi_knowledge.json'), 'utf8');
  defiKnowledge = JSON.parse(defiData);
  console.log('DeFi knowledge loaded successfully!');
} catch (error) {
  console.error('Error loading DeFi knowledge:', error);
  defiKnowledge = {};
}

/**
 * Get an explanation for a DeFi term
 * 
 * @param term The DeFi term to explain
 * @returns Explanation of the term or null if not found
 */
export function getDefiTermExplanation(term: string): string | null {
  const normalizedTerm = term.toLowerCase().trim();
  
  // Check for direct match
  if (defiKnowledge[normalizedTerm]) {
    return defiKnowledge[normalizedTerm];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(defiKnowledge)) {
    if (normalizedTerm.includes(key) || key.includes(normalizedTerm)) {
      return value;
    }
  }
  
  return null;
}

/**
 * List all available DeFi terms
 * 
 * @returns Array of all DeFi terms
 */
export function listDefiTerms(): string[] {
  return Object.keys(defiKnowledge);
}

/**
 * Check if input is asking about a DeFi term
 * 
 * @param input User input to check
 * @returns True if the input is asking about a DeFi term
 */
export function isDefiTermQuestion(input: string): boolean {
  const normalizedInput = input.toLowerCase();
  
  // Check if the input contains question patterns about crypto/defi
  const questionPatterns = [
    /what is ([a-z\s]+)(\?)?$/i,
    /what does ([a-z\s]+) mean(\?)?$/i,
    /explain ([a-z\s]+)(\?)?$/i,
    /define ([a-z\s]+)(\?)?$/i
  ];
  
  // Extract potential term from question
  let potentialTerm: string | null = null;
  
  for (const pattern of questionPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      potentialTerm = match[1].trim();
      break;
    }
  }
  
  // If we extracted a term, check if it exists in our knowledge base
  if (potentialTerm) {
    // Check for direct match
    if (defiKnowledge[potentialTerm]) {
      return true;
    }
    
    // Check for partial matches
    for (const key of Object.keys(defiKnowledge)) {
      if (potentialTerm.includes(key) || key.includes(potentialTerm)) {
        return true;
      }
    }
  }
  
  // Check if input contains any DeFi terms directly
  for (const term of Object.keys(defiKnowledge)) {
    if (normalizedInput.includes(term)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get a DeFi term explanation from user input
 * 
 * @param input User input that may contain a DeFi term question
 * @returns Explanation of the term or null if no term found
 */
export function getDefiExplanationFromInput(input: string): string | null {
  const normalizedInput = input.toLowerCase();
  
  // Extract potential term from question
  let potentialTerm: string | null = null;
  
  const questionPatterns = [
    /what is ([a-z\s]+)(\?)?$/i,
    /what does ([a-z\s]+) mean(\?)?$/i,
    /explain ([a-z\s]+)(\?)?$/i,
    /define ([a-z\s]+)(\?)?$/i
  ];
  
  for (const pattern of questionPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      potentialTerm = match[1].trim();
      break;
    }
  }
  
  // If we extracted a term, look for it in our knowledge base
  if (potentialTerm) {
    // Direct match
    if (defiKnowledge[potentialTerm]) {
      return defiKnowledge[potentialTerm];
    }
    
    // Partial matches
    for (const [key, value] of Object.entries(defiKnowledge)) {
      if (potentialTerm.includes(key) || key.includes(potentialTerm)) {
        return value;
      }
    }
  }
  
  // Check if input contains any DeFi terms directly
  for (const [term, explanation] of Object.entries(defiKnowledge)) {
    if (normalizedInput.includes(term)) {
      return explanation;
    }
  }
  
  return null;
}