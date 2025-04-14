/**
 * Personalities Information Module for Donald Toad AI
 * 
 * This module contains information and responses related to finance and crypto personalities.
 * It provides Donald Toad-style responses about key figures in the financial and crypto world.
 */

import { randomInt } from 'crypto';

/**
 * Finance and crypto personalities
 */
export interface Personality {
  title: string;
  meme_quote: string;
  specialty?: string;
}

export const personalities: Record<string, Personality> = {
  "Jerome Powell": {
    title: "Fed Chair",
    meme_quote: "Raises rates like it's his hobby. 'Data dependent' = market panic button.",
    specialty: "interest_rates"
  },
  "Larry Fink": {
    title: "CEO of BlackRock",
    meme_quote: "When Larry blinks, Wall Street flinches."
  },
  "Vitalik Buterin": {
    title: "Ethereum Co-founder",
    meme_quote: "Invented Ethereum at 19. You were still rage-quitting Minecraft."
  },
  "Joe Lubin": {
    title: "ConsenSys Founder",
    meme_quote: "Behind MetaMask, Linea, and probably your favorite dApp."
  }
};

/**
 * Economic concepts explained in Donald Toad style
 */
export const economicConcepts: Record<string, string> = {
  "inflation": "Inflation is when your money says 'I'm worth less today than yesterday.' It's mostly measured by the CPI and driven by supply/demand imbalances, money supply, and policy.",
  "quantitative_easing": "Quantitative Easing (QE) is when central banks buy assets to pump liquidity into the system. It's like turning on the money printer — sometimes good, sometimes spicy.",
  "interest_rates": "Interest rates are how the Fed controls the economic party. Hike it, and borrowing gets expensive. Drop it, and everyone goes YOLO with credit."
};

/**
 * Generate a Toad-style response about a personality
 */
export function generatePersonalityResponse(name: string): string | null {
  const normalizedName = name.toLowerCase();
  
  // Try to match with known personalities
  for (const [personName, info] of Object.entries(personalities)) {
    if (normalizedName.includes(personName.toLowerCase())) {
      const randomPhrases = [
        "A TREMENDOUS figure in the industry!",
        "One of the GREATEST minds in finance!",
        "Very impressive, very powerful individual!",
        "A real bigshot, believe me folks!"
      ];
      
      return `${personName} - ${info.title}? ${randomPhrases[randomInt(0, randomPhrases.length)]} 

🧠 Known for: ${info.meme_quote}

🐸 Donald Toad's Take:
I know ${personName} very well. We've had many conversations, beautiful conversations. Some say we have the BEST conversations! ${getRandomComment(personName)}`;
    }
  }
  
  return null;
}

/**
 * Generate a random comment about a specific personality
 */
function getRandomComment(name: string): string {
  const comments: Record<string, string[]> = {
    "Jerome Powell": [
      "His money printer has been working overtime! Brrrrr!",
      "He should listen to me more about interest rates. I would make the BEST Fed Chair!",
      "He's good, but not as good as I would be running the Fed!",
      "The economy would be MUCH stronger if he followed my advice!"
    ],
    "Larry Fink": [
      "BlackRock manages over $10 TRILLION. That's a LOT of zeros, folks!",
      "He finally realized crypto is the future - about time!",
      "His Bitcoin ETF will make many people very rich. Including me!",
      "Smart guy, but I would have moved BlackRock into crypto YEARS ago!"
    ],
    "Vitalik Buterin": [
      "Very smart, very skinny guy. I told him to eat more hamberders!",
      "Created Ethereum and started a revolution. I like revolutionaries!",
      "His brain works differently than most people's. Like mine, but more nerdy!",
      "I could have invented Ethereum too, but I was busy making deals!"
    ],
    "Joe Lubin": [
      "ConsenSys and Linea are doing BIG things for Web3!",
      "MetaMask is the BEST wallet, and he's behind it. Great taste!",
      "He's building the infrastructure for the crypto future. Very important!",
      "We discussed Linea over covfefe. I told him it would be HUGE!"
    ]
  };
  
  const nameComments = comments[name] || [
    "They're doing big things, really tremendous work!",
    "I know all the best people in this industry, and they're definitely one of them!",
    "We've had many productive meetings. Very productive!",
    "They call me for advice all the time. ALL the time!"
  ];
  
  return nameComments[randomInt(0, nameComments.length)];
}

/**
 * Check if a message is asking about a personality
 */
export function isAskingAboutPersonality(message: string): boolean {
  // Check for general patterns that suggest asking about a person
  const generalPatterns = [
    /who is/i,
    /tell me about/i,
    /what do you think (of|about)/i,
    /who\'s/i,
    /whois/i
  ];
  
  if (generalPatterns.some(pattern => pattern.test(message))) {
    // If general pattern is found, check if any personality name is mentioned
    for (const personName of Object.keys(personalities)) {
      if (message.toLowerCase().includes(personName.toLowerCase())) {
        return true;
      }
    }
  }
  
  // Otherwise, check if any name is directly mentioned
  return Object.keys(personalities).some(name => 
    message.toLowerCase().includes(name.toLowerCase())
  );
}