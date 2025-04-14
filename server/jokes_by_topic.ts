import fs from 'fs';
import path from 'path';

/**
 * Interface for the joke database structure
 */
interface JokeDatabase {
  [topic: string]: string[];
}

// Load the jokes database
let jokeDatabase: JokeDatabase;
try {
  const jokeData = fs.readFileSync(path.join(process.cwd(), 'server', 'jokes_by_topic.json'), 'utf-8');
  jokeDatabase = JSON.parse(jokeData);
  console.log('Jokes database loaded successfully!');
} catch (error) {
  console.error('Error loading jokes database:', error);
  jokeDatabase = {};
}

/**
 * Get a joke for a specific topic
 * @param topic The topic to find a joke for
 * @returns A joke for the given topic or null if none found
 */
export function getJokeForTopic(topic: string): string | null {
  // Normalize the topic
  const normalizedTopic = topic.toLowerCase().trim();
  
  // Check if we have jokes for this topic
  for (const [jokeTopic, jokes] of Object.entries(jokeDatabase)) {
    if (normalizedTopic.includes(jokeTopic) && jokes.length > 0) {
      // Get a random joke from the array
      const randomIndex = Math.floor(Math.random() * jokes.length);
      return jokes[randomIndex];
    }
  }
  
  // If we don't have a specific topic joke, try to find the closest match
  const allTopics = Object.keys(jokeDatabase);
  for (const dbTopic of allTopics) {
    if (normalizedTopic.includes(dbTopic) && jokeDatabase[dbTopic].length > 0) {
      const randomIndex = Math.floor(Math.random() * jokeDatabase[dbTopic].length);
      return jokeDatabase[dbTopic][randomIndex];
    }
  }
  
  // If no match is found, return null
  return null;
}

/**
 * Get a joke based on a user message
 * @param message The user's message to extract topics from
 * @returns A joke relevant to the topic in the message or null if no match
 */
export function getTopicSpecificJoke(message: string): string | null {
  // Extract potential topics from the message
  const words = message.toLowerCase().split(/\s+/);
  
  // Try to find jokes for each word
  for (const word of words) {
    // Skip very short words and common words
    if (word.length < 3 || ['the', 'and', 'for', 'but', 'you', 'what', 'who', 'how', 'why', 'when', 'where', 'that', 'this'].includes(word)) {
      continue;
    }
    
    const joke = getJokeForTopic(word);
    if (joke) {
      return joke;
    }
  }
  
  // If no specific topic joke was found, check for general categories
  const categories = [
    { keywords: ['money', 'finance', 'bank', 'dollar', 'rich', 'wealth'], topic: 'economy' },
    { keywords: ['buy', 'sell', 'price', 'market', 'worth'], topic: 'trading' },
    { keywords: ['coin', 'token', 'blockchain', 'satoshi'], topic: 'crypto' },
    { keywords: ['president', 'vote', 'election', 'democrat', 'republican', 'trump', 'biden'], topic: 'politics' }
  ];
  
  for (const category of categories) {
    if (category.keywords.some(keyword => message.toLowerCase().includes(keyword))) {
      const joke = getJokeForTopic(category.topic);
      if (joke) {
        return joke;
      }
    }
  }
  
  // If still no match, return null
  return null;
}

/**
 * List all available joke topics
 */
export function listJokeTopics(): string[] {
  return Object.keys(jokeDatabase);
}