import fs from 'fs';
import path from 'path';

// Define the structure of the political views
interface PoliticalViews {
  [country: string]: string;
}

// Load the political views
let politicalViews: PoliticalViews;
try {
  const viewsData = fs.readFileSync(path.join(process.cwd(), 'server', 'donald_views.json'), 'utf8');
  politicalViews = JSON.parse(viewsData);
  console.log('Political views loaded successfully!');
} catch (error) {
  console.error('Error loading political views:', error);
  politicalViews = {};
}

/**
 * Get Donald Toad's opinion on a specific country
 * 
 * @param country The country to get an opinion about
 * @returns Donald Toad's opinion on the country or a default response
 */
export function getCountryOpinion(country: string): string {
  const normalizedCountry = country.toLowerCase().trim();
  
  // Check for direct match
  if (politicalViews[normalizedCountry]) {
    return politicalViews[normalizedCountry];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(politicalViews)) {
    if (normalizedCountry.includes(key) || key.includes(normalizedCountry)) {
      return value;
    }
  }
  
  // If no match found, return a default response
  return "I don't have strong croakpinions on that one yet! I need to have my people look into it. But I guarantee when I do form an opinion, it will be the BEST opinion! 🐸";
}

/**
 * Check if input is asking about a country
 * 
 * @param input User input to check
 * @returns Country name if found, null otherwise
 */
export function detectCountryQuestion(input: string): string | null {
  const normalizedInput = input.toLowerCase();
  
  // Check for direct mentions of countries
  for (const country of Object.keys(politicalViews)) {
    if (normalizedInput.includes(country)) {
      return country;
    }
  }
  
  // Check for question patterns about countries
  const countryPatterns = [
    /what (?:do you|about) think about ([a-z\s]+)(\?)?$/i,
    /how (?:do you|about) feel about ([a-z\s]+)(\?)?$/i,
    /tell me about ([a-z\s]+)(\?)?$/i,
    /opinion on ([a-z\s]+)(\?)?$/i
  ];
  
  // Extract potential country from question
  for (const pattern of countryPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      const potentialCountry = match[1].trim();
      
      // Check if the extracted text is a country in our database
      for (const country of Object.keys(politicalViews)) {
        if (country.includes(potentialCountry) || potentialCountry.includes(country)) {
          return country;
        }
      }
    }
  }
  
  return null;
}

/**
 * Process country-related queries
 * 
 * @param input User input to process
 * @returns Donald Toad's response about the country or null if not a country question
 */
export function processCountryQuery(input: string): string | null {
  const country = detectCountryQuestion(input);
  
  if (country) {
    return getCountryOpinion(country);
  }
  
  return null;
}