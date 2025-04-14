/**
 * Tariffs Information Module for Donald Toad AI
 * 
 * This module contains information and responses related to tariffs and trade policy.
 * It provides Donald Toad-style responses about tariffs with meme-infused explanations.
 * Based on content from the master knowledge database.
 */

import { randomInt } from 'crypto';

/**
 * Main tariffs information
 */
export const tariffsInfo = {
  description: "Tariffs are taxes on imported goods. They affect trade, prices, and economics.",
  jokes: [
    "Tariffs: When your country gets salty about imports.",
    "Tariffs are like the cover charge at a club no one wants to be at.",
    "Want to boost inflation and make everyone mad? Just add tariffs.",
    "Tariffs are the economic version of 'you can't sit with us.'",
    "Tariffs: Because your toaster needs to be 30% more expensive to make your economy 'great again'. 🇺🇸",
    "Trade war? More like tax dodgeball.",
    "Tariffs are like relationship boundaries… but with shipping containers.",
    "Who needs diplomacy when you've got tariffs and Twitter beefs?",
    "Tariffs: Making goods more expensive since the 1700s.",
    "Tariffs are like diet taxes — they still hurt but look healthier.",
    "Governments be like: 'We need to protect local industries.' *Slaps 50% tax on bananas*"
  ],
  examples: [
    "Why did the chicken cross the border? It didn't. It got hit with a 25% import tariff.",
    "The US puts tariffs on steel. Canada puts maple syrup on pancakes. One of them is peaceful."
  ]
};

/**
 * Generate a random tariff joke
 */
export function getRandomTariffJoke(): string {
  return tariffsInfo.jokes[randomInt(0, tariffsInfo.jokes.length)];
}

/**
 * Generate a random tariff example
 */
export function getRandomTariffExample(): string {
  return tariffsInfo.examples[randomInt(0, tariffsInfo.examples.length)];
}

/**
 * Get full tariffs information formatted for a response
 */
export function getTariffsInformation(): string {
  return `🐸 Donald Toad AI – Tariffs Explained 🐸

🧠 What are Tariffs anyway?
${tariffsInfo.description}

😂 The Donald Toad Take:
${getRandomTariffJoke()}

📊 Real World Example:
${getRandomTariffExample()}

🔥 Why do I care about Tariffs?
Tariffs are a powerful tool for making your economy GREAT! They protect domestic businesses from foreign competition, even if they make everything more expensive for consumers. It's all about that trade leverage, folks!

🌎 Effect on Markets:
When tariffs get slapped on goods, markets get nervous. Stocks wobble, currencies fluctuate, and crypto sometimes becomes a safe haven because it's not tied to any specific country. That's why Donald Toad Coin is the BEST hedge against tariff wars!`;
}

/**
 * Check if a message is asking about tariffs
 */
export function isAskingAboutTariffs(message: string): boolean {
  const tariffPatterns = [
    /tariff/i,
    /trade war/i,
    /import tax/i,
    /export tax/i,
    /custom(s)? dut(y|ies)/i,
    /trade polic(y|ies)/i,
    /import dut(y|ies)/i,
    /trade barrier/i,
    /protectionism/i
  ];

  return tariffPatterns.some(pattern => pattern.test(message));
}

/**
 * Generate a Toad-style response to a tariff question
 */
export function generateTariffResponse(message: string): string {
  // If message contains specific keywords, provide a more tailored response
  if (message.toLowerCase().includes('china')) {
    return `China tariffs? TREMENDOUS policy! When you put tariffs on Chinese goods, you're telling them: "Play fair or pay up!" They've been taking advantage of us for TOO LONG with unfair trade practices. My tariffs were the best, believe me! The BEST way to negotiate is from a position of strength - that's why tariffs work! 🐸`;
  }
  
  if (message.toLowerCase().includes('eu') || message.toLowerCase().includes('europe')) {
    return `European tariffs are so unfair to us! Did you know they put HUGE tariffs on our products while we let their stuff in nearly tax-free? Not on my watch! Fair trade means RECIPROCAL trade - if they tax our goods, we tax theirs! It's only fair, folks! 🐸`;
  }

  if (message.toLowerCase().includes('canada') || message.toLowerCase().includes('mexico')) {
    return `Our neighbors need to understand - fair borders mean fair trade! That's why I renegotiated NAFTA into the much better USMCA! When countries like Canada put tariffs on our dairy, we respond with tariffs on their aluminum. That's how you get respect in global trade! 🐸`;
  }

  // Default response if no specific keywords are found
  return getTariffsInformation();
}