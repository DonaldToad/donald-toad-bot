/**
 * Web Search Module for Donald Toad AI
 * 
 * This module provides a way to search for information online when the bot
 * doesn't have the answer in its knowledge base. It uses a simple search approach
 * with predefined factual responses to simulate web search capability.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

// Simple factual information cache to simulate web search without API dependency
const factualInformation: Record<string, string> = {
  // Cities and locations
  "tokyo": "Tokyo is the capital and largest city of Japan, located on the eastern coast of Honshu Island. It's a major global financial and economic center with a population of approximately 14 million in the city proper and over 37 million in the metropolitan area, making it the most populous metropolitan area in the world.",
  "paris": "Paris is the capital and largest city of France, situated on the Seine River in the north-central part of the country. Known as the 'City of Light', Paris is renowned for its art, fashion, gastronomy, and culture. It's home to iconic landmarks like the Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral.",
  "new york": "New York City is the most populous city in the United States, located at the southern tip of New York State. It consists of five boroughs: Manhattan, Brooklyn, Queens, The Bronx, and Staten Island. NYC is a global hub for finance, media, art, fashion, research, technology, and entertainment.",
  "london": "London is the capital and largest city of England and the United Kingdom. It stands on the River Thames in southeast England. London is a global city and one of the world's leading financial, cultural, and tourist destinations, known for landmarks like Big Ben, Tower Bridge, and Buckingham Palace.",
  
  // Natural wonders
  "mount everest": "Mount Everest is Earth's highest mountain above sea level, located in the Mahalangur Himal sub-range of the Himalayas on the border between Nepal and Tibet. Its elevation is 29,032 feet (8,849 meters). It was first successfully climbed by Sir Edmund Hillary and Tenzing Norgay in 1953.",
  "amazon river": "The Amazon River is the largest river by discharge volume of water in the world, and the second in length after the Nile. It runs through Peru, Colombia, and Brazil before emptying into the Atlantic Ocean. The river's drainage basin covers about 40% of South America and is home to the Amazon Rainforest.",
  "great barrier reef": "The Great Barrier Reef is the world's largest coral reef system, located off the coast of Queensland, Australia. It extends for over 1,400 miles and comprises more than 2,900 individual reefs and 900 islands. It's a UNESCO World Heritage site and is visible from outer space.",
  "sahara desert": "The Sahara is the largest hot desert in the world, covering most of North Africa. It spans 11 countries including Algeria, Chad, Egypt, Libya, Mali, Mauritania, Morocco, Niger, Sudan, Tunisia, and Western Sahara. The Sahara covers an area of about 3.6 million square miles.",
  
  // Accommodation types
  "bed and breakfast": "A bed and breakfast (B&B) is a small lodging establishment that offers overnight accommodation and breakfast. B&Bs are often private family homes with fewer rooms than a hotel, offering a more personal, homey atmosphere. They typically feature unique, individually decorated rooms, personalized service, and breakfast made with locally sourced ingredients.",
  "hotel": "A hotel is a commercial establishment providing lodging, meals, and other services to guests. Hotels range from budget accommodations to luxury establishments, offering various amenities like restaurants, swimming pools, fitness centers, business facilities, and concierge services depending on their rating and target clientele.",
  "motel": "A motel (motor hotel) is a roadside hotel designed for motorists, typically with rooms directly accessible from the parking area. Motels are convenient for travelers, offering easy access, free parking, and rooms with basic amenities. They became popular in the United States during the expansion of highway travel in the mid-20th century.",
  "hostel": "A hostel is a low-cost accommodation that typically offers shared dormitory-style rooms with multiple beds, though private rooms may also be available. Hostels are popular among young travelers and backpackers, featuring communal facilities like kitchens, lounges, and bathrooms. They often organize social activities to promote interaction among guests.",
  
  // Blockchain and L2 terms
  "layer 2": "Layer 2 (L2) refers to blockchain scaling solutions built on top of existing blockchains like Ethereum. They process transactions off the main chain (Layer 1) while inheriting its security, helping to increase transaction speed and reduce fees. Examples include rollups (like Optimistic and ZK rollups), state channels, and sidechains.",
  "base blockchain": "Base is an Ethereum Layer 2 (L2) blockchain created by Coinbase. Launched in 2023, it uses Optimistic rollup technology to offer lower fees and faster transactions while maintaining Ethereum's security. Base aims to bring the next billion users to crypto by providing a secure, low-cost, developer-friendly platform for building decentralized applications.",
  "zksync": "zkSync is a Layer 2 scaling solution for Ethereum using zero-knowledge rollup technology (ZK rollups). It bundles hundreds of transactions off-chain and generates cryptographic proofs to verify their validity on Ethereum. This approach offers fast finality, high security, and lower fees while maintaining Ethereum's security guarantees.",
  "arbitrum": "Arbitrum is a Layer 2 (L2) scaling solution for Ethereum using Optimistic rollup technology. It processes transactions off the main Ethereum chain, bundling them together and only posting the transaction data on Ethereum. Arbitrum offers lower fees, faster transactions, and maintains EVM compatibility, allowing existing Ethereum applications to run with minimal modifications.",
  "optimism": "Optimism is a Layer 2 (L2) scaling solution for Ethereum that uses Optimistic rollup technology. It processes transactions off-chain and posts compressed transaction data to Ethereum. This approach significantly reduces gas fees and increases throughput while inheriting Ethereum's security properties. Optimism maintains full compatibility with Ethereum tools and smart contracts.",
  
  // Music and Entertainment
  "alice cooper": "Alice Cooper is an American rock singer, songwriter, and musician whose career spans over five decades. Born Vincent Damon Furnier, he adopted his band's name as his own. Known for his theatrical shock rock performances featuring fake blood, guillotines, electric chairs, and snakes, Cooper pioneered a grandly theatrical and macabre stage show. His hit songs include 'School's Out,' 'No More Mr. Nice Guy,' and 'Poison.' He was inducted into the Rock and Roll Hall of Fame in 2011.",
  "rolling stones": "The Rolling Stones are an English rock band formed in London in 1962. The original lineup consisted of Mick Jagger (lead vocals), Keith Richards (guitar), Brian Jones (guitar), Bill Wyman (bass), Charlie Watts (drums), and Ian Stewart (piano). Known for hits like '(I Can't Get No) Satisfaction,' 'Paint It Black,' and 'Start Me Up,' they're one of the most enduring and commercially successful rock bands in history. They were inducted into the Rock and Roll Hall of Fame in 1989 and have sold more than 200 million records worldwide.",
  "beatles": "The Beatles were an English rock band formed in Liverpool in 1960, consisting of John Lennon, Paul McCartney, George Harrison, and Ringo Starr. They are regarded as the most influential band of all time and were integral to the development of 1960s counterculture and popular music's recognition as an art form. Their best-known albums include 'Sgt. Pepper's Lonely Hearts Club Band,' 'Abbey Road,' and 'The White Album.' They disbanded in 1970 but remain the best-selling music act of all time.",
  "michael jackson": "Michael Jackson (1958-2009) was an American singer, songwriter, and dancer known as the 'King of Pop.' His contributions to music, dance, and fashion made him a global figure in popular culture for over four decades. The eighth child of the Jackson family, he debuted with the Jackson 5 before launching a solo career. His 1982 album 'Thriller' is the best-selling album of all time. His innovative music videos and iconic dance moves, including the moonwalk, influenced countless artists across genres.",
  
  // Sports
  "super bowl": "The Super Bowl is the annual championship game of the National Football League (NFL), the highest level of professional American football in the United States. It has served as the final game of every NFL season since 1966. The game is typically played on the first Sunday in February and is accompanied by elaborate halftime shows, expensive commercial advertisements, and large parties. It's one of the most-watched television broadcasts in the United States each year and has become something of a national holiday.",
  "world cup": "The FIFA World Cup is an international football (soccer) competition contested by the senior men's national teams of the members of FIFA (Fédération Internationale de Football Association). It takes place every four years since its inaugural tournament in 1930, except in 1942 and 1946 when it was not held because of World War II. The current champion is Argentina, which won its third title at the 2022 tournament in Qatar. It's the most prestigious football tournament in the world and the most widely viewed and followed sporting event globally.",
  "olympic games": "The Olympic Games are a major international multi-sport event held once every four years, featuring summer and winter sports competitions in which thousands of athletes from around the world participate. The Olympics are considered the world's foremost sports competition with more than 200 nations participating. The ancient Olympic Games were held in Olympia, Greece, from the 8th century BC to the 4th century AD. The modern Olympics began in Athens, Greece, in 1896. The International Olympic Committee (IOC) organizes the Games and oversees the Olympic Movement.",
  
  // Technology
  "artificial intelligence": "Artificial Intelligence (AI) refers to the simulation of human intelligence processes by machines, especially computer systems. These processes include learning (the acquisition of information and rules for using the information), reasoning (using rules to reach approximate or definite conclusions), and self-correction. AI applications include expert systems, natural language processing, speech recognition, and machine vision. Modern AI techniques include deep learning, a type of machine learning that can learn from unstructured or unlabeled data, and reinforcement learning, where an AI learns to make decisions by being rewarded for correct ones."
};

/**
 * Search the web for information using a simulated approach
 * 
 * @param query The search query text
 * @returns A formatted response with search results in Donald Toad style
 */
export async function searchWeb(query: string): Promise<string> {
  try {
    console.log(`Searching web for: ${query}`);
    
    // Extract key terms from the query
    const cleanQuery = query.toLowerCase()
      .replace(/[?.!,;:]/g, '')
      .replace(/where is|what is|tell me about|who is|when is|how is/gi, '')
      .trim();
    
    console.log(`Clean search query: "${cleanQuery}"`);
    
    // First check our factual information cache
    for (const [key, info] of Object.entries(factualInformation)) {
      if (cleanQuery.includes(key)) {
        console.log(`Found cached information for: ${key}`);
        return formatSearchResponse(query, info);
      }
    }
    
    // If not in our cache, try to perform a simple web search (Wikipedia summary)
    try {
      const wikipediaUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
      console.log(`Trying Wikipedia API: ${wikipediaUrl}`);
      
      const response = await axios.get(wikipediaUrl, { 
        headers: { 'User-Agent': 'Donald Toad AI/1.0' },
        timeout: 5000
      });
      
      if (response.data && response.data.extract) {
        console.log('Found Wikipedia information');
        return formatSearchResponse(query, response.data.extract);
      }
    } catch (error) {
      console.log('Wikipedia search failed, using fallback');
    }
    
    // Final fallback - we couldn't find good info
    return "I tried searching for this, but couldn't find anything useful. Fake news probably hiding the truth! The BEST information is what I already told you anyway! 🐸";
  } catch (error) {
    console.error('Error searching the web:', error);
    return "The internet is broken right now - SAD! Big Tech is probably censoring this information! I have the most accurate knowledge anyway, believe me! 🐸";
  }
}

/**
 * Format the search response in Donald Toad style
 */
function formatSearchResponse(query: string, information: string): string {
  // Increased max length to show more complete information
  const maxLength = 800;
  let truncatedInfo = information.length > maxLength ? 
    information.substring(0, maxLength) + '...' : information;
  
  return `I've got TREMENDOUS search skills! Here's what I found about "${query}":\n\n${truncatedInfo}\n\nI find the BEST results. People say I have the greatest search skills ever. Nobody searches like me! 🐸`;
}

/**
 * Decide whether to use web search for a query
 * Only use when we don't have specific knowledge and it's not a command or math
 * 
 * @param message The user's message
 * @returns True if web search should be used
 */
export function shouldUseWebSearch(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  console.log("Web search decision for:", message);
  
  // Don't use web search for these topics that we handle internally
  const internalTopics = [
    'linea', 'dtc', 'donald toad coin', 'metamask', 'wallet', 
    'inflation', 'tariff', 'interest rate', 'quantitative', 'federal reserve',
    'joke', 'recipe', 'number game', 'guess', 'bitcoin', 'eth', 'crypto', 'token',
    'who is donald toad', 'who are you', 'who\'s donald toad', 'tell me about yourself', 'introduce yourself'
  ];
  
  // Check if it's a topic we handle internally
  for (const topic of internalTopics) {
    if (lowerMessage.includes(topic)) {
      console.log(`Not using web search: contains internal topic "${topic}"`);
      return false;
    }
  }
  
  // Don't use for very short queries or commands
  if (message.length < 4 || message.startsWith('/')) {
    console.log("Not using web search: too short or command");
    return false;
  }
  
  // Don't use for pure numbers or math expressions (might be game guesses or calculations)
  if (/^\d+$/.test(message.trim()) || /[\d\+\-\*\/\(\)]/.test(message.trim())) {
    console.log("Not using web search: numeric or math expression");
    return false;
  }
  
  // Special block for Donald Toad identity questions (even with slight variations)
  if (/who.*(?:is|are).*(?:donald\s*toad|you)|tell.*(?:me|us).*(?:about\s*yourself|donald\s*toad)|introduce\s*yourself/i.test(lowerMessage)) {
    console.log("Not using web search: Donald Toad identity question");
    return false;
  }
  
  // Determine if it's a factual query we should search for
  // Match more patterns including general queries like "where is Tokyo"
  const isFactualQuery = /^(what|when|where|who|why|how|tell me about|explain|which|what's|can you find|search for|where is|who is|what is)/i.test(message.trim());
  
  console.log("Web search decision:", isFactualQuery ? "WILL search" : "Will NOT search");
  return isFactualQuery;
}