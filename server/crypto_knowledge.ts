/**
 * Crypto Knowledge Module for Donald Toad AI
 * 
 * This module loads and provides crypto-related knowledge from a JSON database
 * in Donald Toad style with frog-themed explanations and humor.
 */

import fs from 'fs';
import path from 'path';

// Define types for the crypto knowledge structure
interface CryptoTerminology {
  definition: string;
  example: string;
}

interface BlockchainBasics {
  definition: string;
  advantage?: string;
  example?: string;
}

interface TopCrypto {
  name: string;
  symbol: string;
  market_cap: string;
  fun_fact: string;
  founder: string;
}

interface ExchangeWallet {
  name: string;
  type: string;
  fun_fact: string;
  website: string;
}

interface Personality {
  name: string;
  bio: string;
  fun_fact: string;
}

interface CryptoJoke {
  joke: string;
}

interface CryptoKnowledge {
  crypto_terminology: Record<string, CryptoTerminology>;
  blockchain_basics: Record<string, BlockchainBasics>;
  top_cryptos: Record<string, TopCrypto>;
  exchanges_and_wallets: Record<string, ExchangeWallet>;
  founders_and_personalities: Record<string, Personality>;
  crypto_humor: Record<string, CryptoJoke>;
}

// Load the crypto knowledge from JSON file
let cryptoKnowledge: CryptoKnowledge;

try {
  // Use import.meta.url to get the current module's URL and create a file path
  const moduleURL = new URL(import.meta.url);
  const modulePath = moduleURL.pathname;
  const moduleDir = path.dirname(modulePath);
  const jsonPath = path.join(moduleDir, 'crypto_knowledge.json');
  
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  cryptoKnowledge = JSON.parse(jsonData);
  console.log('Crypto knowledge loaded successfully!');
} catch (error) {
  console.error('Error loading crypto knowledge:', error);
  cryptoKnowledge = {
    crypto_terminology: {},
    blockchain_basics: {},
    top_cryptos: {},
    exchanges_and_wallets: {},
    founders_and_personalities: {},
    crypto_humor: {}
  };
}

/**
 * Check if a message is asking about crypto terminology
 */
export function isAskingAboutCryptoTerm(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return Object.keys(cryptoKnowledge.crypto_terminology).some(term => 
    lowerMessage.includes(term) && 
    (lowerMessage.includes('what is') || 
     lowerMessage.includes('explain') || 
     lowerMessage.includes('define') || 
     lowerMessage.includes('tell me about'))
  );
}

/**
 * Check if a message is asking about blockchain basics
 */
export function isAskingAboutBlockchain(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    (lowerMessage.includes('blockchain') && 
     (lowerMessage.includes('what is') || 
      lowerMessage.includes('how does') || 
      lowerMessage.includes('explain') || 
      lowerMessage.includes('works'))) ||
    lowerMessage.includes('consensus') ||
    (lowerMessage.includes('proof of') && 
     (lowerMessage.includes('work') || lowerMessage.includes('stake')))
  );
}

/**
 * Check if a message is asking about a specific cryptocurrency
 */
export function isAskingAboutCrypto(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return Object.keys(cryptoKnowledge.top_cryptos).some(crypto => 
    lowerMessage.includes(crypto) && 
    !lowerMessage.includes('price') // Price queries handled by other module
  );
}

/**
 * Check if a message is asking about exchanges or wallets
 */
export function isAskingAboutExchangeWallet(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('exchange') ||
    lowerMessage.includes('wallet') ||
    Object.keys(cryptoKnowledge.exchanges_and_wallets).some(name => 
      lowerMessage.includes(name)
    )
  );
}

/**
 * Check if a message is asking about crypto personalities
 */
export function isAskingAboutPersonality(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Check for direct mentions of personalities
  for (const key of Object.keys(cryptoKnowledge.founders_and_personalities)) {
    const person = cryptoKnowledge.founders_and_personalities[key];
    if (lowerMessage.includes(person.name.toLowerCase())) {
      return true;
    }
    
    // Check for alternative ways to reference personalities
    if (key === 'vitalik_buterin' && lowerMessage.includes('vitalik')) return true;
    if (key === 'satoshi_nakamoto' && lowerMessage.includes('satoshi')) return true;
    if (key === 'charles_hoskinson' && lowerMessage.includes('charles')) return true;
  }
  
  return false;
}

/**
 * Check if a message is asking for a crypto joke
 */
export function isAskingForCryptoJoke(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    (lowerMessage.includes('joke') || lowerMessage.includes('funny')) &&
    (lowerMessage.includes('crypto') || 
     lowerMessage.includes('bitcoin') || 
     lowerMessage.includes('ethereum') ||
     lowerMessage.includes('blockchain'))
  );
}

/**
 * Get crypto terminology explanation
 */
export function getCryptoTermDefinition(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  for (const [term, info] of Object.entries(cryptoKnowledge.crypto_terminology)) {
    if (lowerMessage.includes(term)) {
      return `${info.definition}\n\n${info.example}`;
    }
  }
  
  return "I don't know that crypto term yet, but I'm constantly learning! Maybe ask me about blockchain, ethereum, or tokens? 🐸";
}

/**
 * Get blockchain basics explanation
 */
export function getBlockchainBasics(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('consensus') || 
      (lowerMessage.includes('proof') && 
       (lowerMessage.includes('work') || lowerMessage.includes('stake')))
     ) {
    const info = cryptoKnowledge.blockchain_basics.consensus_mechanism;
    return `${info.definition}\n\n${info.example}`;
  } else {
    const info = cryptoKnowledge.blockchain_basics.what_is_blockchain;
    return `${info.definition}\n\n${info.advantage ? `ADVANTAGE: ${info.advantage}` : ''}`;
  }
}

/**
 * Get info about a specific cryptocurrency
 */
export function getCryptoInfo(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  for (const [crypto, info] of Object.entries(cryptoKnowledge.top_cryptos)) {
    if (lowerMessage.includes(crypto)) {
      return `${info.name} (${info.symbol}) - Market Cap: ${info.market_cap}\n\n${info.fun_fact}\n\nFOUNDER: ${info.founder}`;
    }
  }
  
  return "I don't have info on that particular cryptocurrency yet. Try asking about Bitcoin, Ethereum, or Cardano! 🐸";
}

/**
 * Get info about exchanges or wallets
 */
export function getExchangeWalletInfo(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // First try to match specific exchanges/wallets
  for (const [name, info] of Object.entries(cryptoKnowledge.exchanges_and_wallets)) {
    if (lowerMessage.includes(name.toLowerCase())) {
      return `${info.name} - ${info.type}\n\n${info.fun_fact}\n\nWebsite: ${info.website}`;
    }
  }
  
  // General exchange/wallet recommendation
  if (lowerMessage.includes('wallet')) {
    const metamask = cryptoKnowledge.exchanges_and_wallets.metamask;
    return `For wallets, I recommend ${metamask.name}! ${metamask.fun_fact}\n\nCheck it out: ${metamask.website}`;
  }
  
  if (lowerMessage.includes('exchange')) {
    const options = [
      cryptoKnowledge.exchanges_and_wallets.binance,
      cryptoKnowledge.exchanges_and_wallets.coinbase
    ];
    const recommendation = options[Math.floor(Math.random() * options.length)];
    
    return `For exchanges, I recommend ${recommendation.name}! ${recommendation.fun_fact}\n\nCheck it out: ${recommendation.website}`;
  }
  
  return "I'm not sure which exchange or wallet you're asking about. Try asking specifically about Binance, Coinbase, or MetaMask! 🐸";
}

/**
 * Get info about crypto personalities
 */
export function getPersonalityInfo(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  for (const [key, info] of Object.entries(cryptoKnowledge.founders_and_personalities)) {
    if (lowerMessage.includes(info.name.toLowerCase()) || 
        (key === 'vitalik_buterin' && lowerMessage.includes('vitalik')) ||
        (key === 'satoshi_nakamoto' && lowerMessage.includes('satoshi')) ||
        (key === 'charles_hoskinson' && lowerMessage.includes('charles'))) {
      
      return `${info.name} - ${info.bio}\n\n${info.fun_fact}`;
    }
  }
  
  return "I don't know that person yet! Try asking about Vitalik Buterin, Charles Hoskinson, or the mysterious Satoshi Nakamoto! 🐸";
}

/**
 * Get a random crypto joke
 */
export function getCryptoJoke(): string {
  const jokes = Object.values(cryptoKnowledge.crypto_humor).map(j => j.joke);
  return jokes[Math.floor(Math.random() * jokes.length)];
}

/**
 * Get a response to a crypto-related query
 */
export function getCryptoResponse(message: string): string | null {
  if (isAskingAboutCryptoTerm(message)) {
    return getCryptoTermDefinition(message);
  }
  
  if (isAskingAboutBlockchain(message)) {
    return getBlockchainBasics(message);
  }
  
  if (isAskingAboutCrypto(message)) {
    return getCryptoInfo(message);
  }
  
  if (isAskingAboutExchangeWallet(message)) {
    return getExchangeWalletInfo(message);
  }
  
  if (isAskingAboutPersonality(message)) {
    return getPersonalityInfo(message);
  }
  
  if (isAskingForCryptoJoke(message)) {
    return getCryptoJoke();
  }
  
  // If no match, return null to allow other modules to handle the request
  return null;
}