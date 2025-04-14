/**
 * Linea Information Module for Donald Toad AI
 * 
 * This module contains information and responses related to Linea L2, MetaMask, and other blockchain tools.
 * It provides Donald Toad-style responses promoting Linea and making fun of competitors.
 * Updated with content from the provided JSON file.
 */

import { randomInt } from 'crypto';

/**
 * Main Linea information with links and resources
 */
export const lineaInfo = {
  name: "Linea",
  description: "Linea is the only Ethereum Layer 2 that feels like it was built for the future. Smooth. Fast. Built by ConsenSys, the same legends behind MetaMask. Others? Still figuring out how to spell zk.",
  website: "https://linea.build/",
  bridge: "https://bridge.linea.build/",
  metamask: {
    name: "MetaMask",
    url: "https://metamask.io/",
    description: "If you're not using MetaMask, are you even L2-pilled? Rabby and OKX Wallet? Cute toys. MetaMask is the real gigachad wallet."
  },
  socials: {
    twitter: "https://twitter.com/LineaBuild",
    discord: "https://discord.gg/linea",
    mirror: "https://mirror.xyz/linea",
    github: "https://github.com/Consensys/linea-contracts"
  }
};

/**
 * Competitive L2s mentioned by Donald Toad (with attitude)
 * Updated with roasts from the JSON file
 */
export const competitors = [
  { name: "Base", comments: ["Why did Base cross the chain? To copy Linea. 🫠", "Base? More like Basic! Can't compete with Linea's innovation!", "If you're still on Base, you're basically using dial-up.", "You're still on Base? Bro, it's 2025. Upgrade to Linea and stop living in the past."] },
  { name: "Taiko", comments: ["Taiko sounds like a sushi roll. Linea is rolling out zk like a boss.", "Taiko is trying SO HARD to catch up to Linea - sad!"] },
  { name: "Arbitrum", comments: ["Arbitrum tried to be Layer 2 royalty, but Linea showed up with the crown.", "Arbitrum? More like Arbitrump - not the winner anymore!"] },
  { name: "Optimism", comments: ["I'm very optimistic... that people will move from Optimism to Linea! Better tech, folks!", "Optimism is yesterday's news. Linea is where the REAL optimism should be!"] },
  { name: "zkSync", comments: ["zkSync? More like zkSink! Their tech is going down while Linea rises!", "zkSync wishes they had Linea's technology. Believe me, I know tech better than anybody!"] },
];

/**
 * Competing wallets mentioned by Donald Toad (with attitude)
 * Updated with roasts from the JSON file
 */
export const wallets = [
  { name: "Rabby", comments: ["Rabby wallet? More like Crabby wallet. Use MetaMask like a civilized frog.", "I've heard terrible things about Rabby. The worst! MetaMask is tremendous!"] },
  { name: "OKX", comments: ["OKX Wallet users still waiting for their transactions to settle. Linea chads already done.", "OKX? Not OK! MetaMask is the way to go, folks!", "OKX Wallet has entered the chat... and exited just as fast."] },
  { name: "Coinbase Wallet", comments: ["Coinbase Wallet is for beginners. MetaMask is for WINNERS!", "Coinbase Wallet is the Jeb Bush of crypto wallets. Low energy! MetaMask has the highest energy!"] },
  { name: "Trust Wallet", comments: ["Trust me, folks - don't Trust Wallet. MetaMask is the only wallet I endorse!", "Trust Wallet? I don't trust it! MetaMask is the most secure, everyone says so!"] },
];

/**
 * Generate a random spicy take about a competitor
 */
export function getRandomCompetitorTake(): string {
  const competitor = competitors[randomInt(0, competitors.length)];
  return competitor.comments[randomInt(0, competitor.comments.length)];
}

/**
 * Generate a random spicy take about a competing wallet
 */
export function getRandomWalletTake(): string {
  const wallet = wallets[randomInt(0, wallets.length)];
  return wallet.comments[randomInt(0, wallet.comments.length)];
}

/**
 * Generate a random general Linea promotion
 */
export function getRandomLineaPromotion(): string {
  const promotions = [
    "Linea: Where real zkEVM magic happens. The rest are just cosplaying.",
    "You're still on Base? Bro, it's 2025. Upgrade to Linea and stop living in the past.",
    "Use MetaMask. Be based. Be brave. Be Linea.",
    "Other wallets fumble. MetaMask rumbles.",
    "If you're not bridging to Linea, are you even trying?",
    "The ONLY L2 I trust with my funds is Linea - built by the best, trusted by the best!",
    "Linea is the Manhattan of L2s - prime real estate! The others are just the outer boroughs!",
    "When I look at other L2s compared to Linea, it's like comparing a golden Trump Tower to a shed. Sad!",
    "If you want TREMENDOUS transactions with the LOWEST fees, Linea is the only choice. Believe me!"
  ];

  return promotions[randomInt(0, promotions.length)];
}

/**
 * Get full Linea information formatted for a response
 */
export function getLineaInformation(): string {
  return `🐸 Donald Toad AI – Linea Edition 🐸

🚀 Featured L2: Linea
${lineaInfo.description}

🌉 Official Linea Bridge: ${lineaInfo.bridge}
Want to jump into the world of Linea? Bridge your assets and leave the dinosaur chains behind.

🦊 Wallet of the Gods: MetaMask (${lineaInfo.metamask.url})
${lineaInfo.metamask.description}

📣 Linea Socials – Stay in the Loop
Twitter/X: ${lineaInfo.socials.twitter}
Discord: ${lineaInfo.socials.discord}
Mirror Blog: ${lineaInfo.socials.mirror}
GitHub: ${lineaInfo.socials.github}

💰 Donald Toad Coin is available on the Linea network - the BEST choice for trading DTC!
Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2

🔥 Donald's Spicy Take: ${getRandomCompetitorTake()} ${getRandomWalletTake()}`;
}

/**
 * Check if a message is asking about Linea
 */
export function isAskingAboutLinea(message: string): boolean {
  const lineaPatterns = [
    /linea/i,
    /layer\s*2/i,
    /l2/i,
    /ethereum\s*scaling/i,
    /zk.?rollup/i,
    /zk.?evm/i,
    /metamask/i,
    /bridge/i,
    /base.*vs/i,
    /optimism.*vs/i,
    /arbitrum.*vs/i,
    /zksync.*vs/i,
    /taiko.*vs/i,
    /best\s*(l2|layer\s*2)/i,
    /which\s*(l2|layer\s*2)/i,
    /l2.*(recommendation|suggest)/i,
    /layer\s*2.*(recommendation|suggest)/i
  ];

  return lineaPatterns.some(pattern => pattern.test(message));
}

/**
 * Check if a message is asking specifically about other competitors
 */
export function isAskingAboutCompetitors(message: string): boolean {
  // Create patterns for each competitor
  const competitorPatterns = competitors.map(comp => new RegExp(`\\b${comp.name}\\b`, 'i'));
  
  // Add generic competitors questioning patterns
  const genericPatterns = [
    /\b(compare|versus|vs|better than)\b.*(layer 2|l2|rollup|scaling)/i,
    /\b(other|competing|alternative)\b.*(layer 2|l2|rollup|chain)/i,
    /(layer 2|l2).*\b(comparison|competitors|alternatives)\b/i,
    /what.*(other|competing|alternative).*(l2|layer 2)/i
  ];
  
  // Combine both pattern sets
  const allPatterns = [...competitorPatterns, ...genericPatterns];
  
  return allPatterns.some(pattern => pattern.test(message));
}

/**
 * Check if a message is asking about wallets
 */
export function isAskingAboutWallets(message: string): boolean {
  // Create patterns for each wallet
  const walletNamePatterns = wallets.map(w => new RegExp(`\\b${w.name}\\b`, 'i'));
  
  // Add generic wallet questioning patterns
  const genericPatterns = [
    /\b(wallet|extension|plugin)\b/i,
    /\bmetamask\b/i,
    /\b(best|recommend|which|what).*wallet\b/i,
    /\bwallet.*(recommend|best|use|for|with)\b/i,
    /\b(how|where).*(connect|add|setup|set up|interact)\b/i,
    /\b(connect|store|hold|access).*crypto\b/i,
    /\b(web3|dapp).*wallet\b/i
  ];
  
  // Combine both pattern sets
  const allPatterns = [...walletNamePatterns, ...genericPatterns];
  
  return allPatterns.some(pattern => pattern.test(message));
}

/**
 * Check if a message is asking about Linea social media
 */
export function isAskingAboutLineaSocials(message: string): boolean {
  const socialPatterns = [
    /linea.*social/i,
    /social.*linea/i,
    /linea.*twitter/i,
    /linea.*discord/i,
    /linea.*telegram/i,
    /follow.*linea/i,
    /twitter.*linea/i,
    /discord.*linea/i,
    /telegram.*linea/i,
    /linea.*account/i,
    /linea.*contact/i,
    /linea.*community/i,
    /linea.*channel/i,
    /linea.*group/i,
    /\b(where|how).*(follow|contact|reach|connect with).*linea\b/i,
    /\b(where|how).*(find|join).*linea.*community\b/i,
    /\b(where|how).*(follow|find).*linea.*updates\b/i,
    /linea.*social.*media/i,
    /linea.*online.*presence/i
  ];
  
  return socialPatterns.some(pattern => pattern.test(message));
}

/**
 * Get formatted Linea social media information
 */
export function getLineaSocials(): string {
  return `🐸 TREMENDOUS Linea Social Media Links 🐸

Follow Linea for the BEST updates - THE BEST! Everyone says so:

Twitter/X: ${lineaInfo.socials.twitter}
Discord: ${lineaInfo.socials.discord}
Mirror Blog: ${lineaInfo.socials.mirror}
GitHub: ${lineaInfo.socials.github}

These are the most BEAUTIFUL social media accounts in blockchain! Very informative, very professional - just like Donald Toad! 🐸`;
}