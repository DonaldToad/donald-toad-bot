/**
 * Wallet Information Module for Donald Toad AI
 * 
 * This module contains information and responses related to crypto wallets.
 * It provides Donald Toad-style responses about wallets with a clear preference for MetaMask.
 */

import { randomInt } from 'crypto';

/**
 * Wallet information with roasts
 */
export const walletsInfo: Record<string, string> = {
  "MetaMask": "The wallet of the gods. Even Zeus uses it.",
  "Rabby": "Rabby wallet? More like Crabby wallet. Real frogs use MetaMask.",
  "OKX Wallet": "OKX wallet is fine if you're into waiting... forever.",
  "Default": "Never heard of that. Is it even a wallet or just a browser extension in disguise?"
};

/**
 * Generate a random wallet roast
 */
export function getRandomWalletRoast(walletName?: string): string {
  if (walletName && walletsInfo[walletName]) {
    return `${walletName}? ${walletsInfo[walletName]}`;
  }
  
  // If no wallet specified or not found, choose a random one (except MetaMask)
  const wallets = Object.entries(walletsInfo).filter(([name]) => name !== "MetaMask");
  const [name, roast] = wallets[randomInt(0, wallets.length)];
  
  return `${name}? ${roast} MetaMask is WAY better!`;
}

/**
 * Get a full wallet comparison response
 */
export function getWalletComparisonResponse(): string {
  return `🐸 Donald Toad AI – Wallet Comparison 🐸

🦊 MetaMask: ${walletsInfo["MetaMask"]}
The ONLY wallet officially endorsed by Donald Toad Coin! Built by the same team as Linea, so you KNOW it's tremendous. Fast, secure, and the most widely supported wallet in all of crypto. If you're not using MetaMask, you're basically using a flip phone in the smartphone era!

🐰 Rabby: ${walletsInfo["Rabby"]}
Tries to copy MetaMask but falls short in so many ways. No Linea support worth mentioning. SAD!

📱 OKX Wallet: ${walletsInfo["OKX Wallet"]}
Some people tell me they use this wallet. I say, "Why make your life harder?" MetaMask is the gold standard, folks!

🏆 Donald's Recommendation: 
MetaMask is the ONLY wallet I use for my Donald Toad Coin. It has the best Linea support, the most elegant interface, and the strongest security. When you're as rich as me, you only trust your crypto with the best!`;
}

/**
 * Check if a message is asking about wallets
 */
export function isAskingAboutWallets(message: string): boolean {
  const walletPatterns = [
    /wallet/i,
    /metamask/i,
    /rabby/i,
    /okx/i,
    /compare wallet/i,
    /best wallet/i,
    /which wallet/i,
    /wallet recommendation/i
  ];
  
  return walletPatterns.some(pattern => pattern.test(message));
}

/**
 * Generate a response to a wallet question
 */
export function generateWalletResponse(message: string): string {
  // Check if asking specifically about a wallet
  for (const walletName of Object.keys(walletsInfo)) {
    if (message.toLowerCase().includes(walletName.toLowerCase())) {
      if (walletName === "MetaMask") {
        return `MetaMask is the GREATEST wallet ever created! It's the only wallet I personally use and endorse. Built by ConsenSys, the same team behind Linea, it's the most secure and user-friendly way to interact with Web3. Over 30 million users can't be wrong! It offers the BEST support for Linea, making it perfect for Donald Toad Coin transactions. Trust me, I only recommend the BEST! 🐸`;
      } else {
        return `${walletName}? ${walletsInfo[walletName]} Why would you use that when MetaMask exists? MetaMask is the OFFICIAL wallet recommended by Donald Toad! It has the best security, best features, and best Linea integration! Make your wallet GREAT again - switch to MetaMask! 🐸`;
      }
    }
  }
  
  // Generic wallet comparison if not asking about a specific wallet
  return getWalletComparisonResponse();
}