/**
 * Donald Toad AI Chat Simulator - A free alternative to paid API services
 * Generates Donald Toad-themed responses without external API dependencies
 * Now with learning capabilities to track and understand user interests
 */

import OpenAI from 'openai';
import { getTokenData, formatTokenDataResponse, getComparisonData, formatComparisonResponse, fetchCryptocurrencyPrice } from './linea-explorer';
import { storage } from './storage';
import { isAskingAboutLinea, isAskingAboutCompetitors, getLineaInformation, getRandomCompetitorTake, getRandomWalletTake, isAskingAboutWallets, isAskingAboutLineaSocials, getLineaSocials } from './linea-info';
import { isAskingAboutTariffs, getTariffsInformation, generateTariffResponse } from './tariffs-info';
import { isAskingAboutPersonality, generatePersonalityResponse, economicConcepts as importedEconomicConcepts } from './personalities-info';
import { isAskingAboutWallets as checkWalletQuestion, generateWalletResponse, getRandomWalletRoast } from './wallet-info';
import { searchWeb, shouldUseWebSearch } from './web-search';
import { isAskingAboutCryptoTerm, isAskingAboutBlockchain, isAskingAboutCrypto, isAskingAboutExchangeWallet, isAskingAboutPersonality as isAskingAboutCryptoPersonality, isAskingForCryptoJoke, getCryptoResponse } from './crypto_knowledge';

// Initialize the OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Financial knowledge database based on provided data
interface TradFiInstitution {
  head?: string;
  ceo?: string;
  role?: string;
  impact?: string;
  assets_under_management?: string;
  influence?: string;
  crypto_moves?: string;
  crypto_involvement?: string;
  crypto_attitude?: string;
  fun_fact?: string;
  status?: string;
  meme?: string;
}

interface CryptoPersonality {
  title: string;
  real_name?: string;
  notable_work?: string;
  focus?: string;
  status?: string;
  note?: string;
  fun_quote?: string;
  fun_fact?: string;
  meme?: string;
}

// Financial institutions knowledge
const tradfiInstitutions: Record<string, TradFiInstitution> = {
  "Federal Reserve": {
    head: "Jerome Powell",
    role: "Chair of the Federal Reserve",
    impact: "Controls U.S. interest rates and monetary policy.",
    fun_fact: "The guy behind the 'money printer go brrr'."
  },
  "BlackRock": {
    ceo: "Larry Fink",
    assets_under_management: "$10+ trillion",
    influence: "The biggest asset manager in the world. When they move, markets shake.",
    crypto_moves: "Filed for Bitcoin ETF and investing in tokenized assets."
  },
  "Goldman Sachs": {
    role: "Top-tier investment bank",
    crypto_involvement: "Blockchain research and digital assets division.",
    meme: "The Illuminati's favorite bank. Probably."
  },
  "JPMorgan Chase": {
    ceo: "Jamie Dimon",
    status: "Largest U.S. bank",
    crypto_attitude: "Skeptical in public, building in private (e.g., JPM Coin).",
    meme: "Hates Bitcoin, builds blockchain. Classic."
  }
};

// Crypto personalities knowledge
const cryptoPersonalities: Record<string, CryptoPersonality> = {
  "Vitalik Buterin": {
    title: "Co-founder of Ethereum",
    notable_work: "Ethereum whitepaper, rollups, decentralization theory",
    fun_quote: "If you don't believe me or don't get it, I don't have time to try to convince you."
  },
  "Joe Lubin": {
    title: "Co-founder of Ethereum, Founder of ConsenSys",
    focus: "Infrastructure, Linea, MetaMask, Infura",
    meme: "Ethereum's quiet architect."
  },
  "Changpeng Zhao": {
    real_name: "Changpeng Zhao (CZ)",
    title: "Founder of Binance",
    status: "Resigned in 2023 after legal issues",
    meme: "Funds are SAFU, but not the CEO."
  },
  "Sam Bankman-Fried": {
    title: "Founder of FTX",
    note: "Convicted in 2023 for fraud and conspiracy",
    meme: "From Bahamas to behind bars."
  },
  "Brian Armstrong": {
    title: "CEO of Coinbase",
    fun_fact: "Pushes hard for crypto regulation clarity in the U.S.",
    meme: "Balancing TradFi suits and crypto hoodies."
  }
};

// Market concepts knowledge
const marketConcepts: Record<string, string> = {
  "Hedge Funds": "Private funds that use complex strategies to maximize returns for wealthy investors.",
  "Quantitative Easing": "Central banks injecting money into the economy. Aka: the money printer.",
  "Yield Curve Inversion": "A recession signal when short-term interest rates exceed long-term ones.",
  "Bitcoin ETF": "Exchange-traded fund that tracks the price of Bitcoin, making it TradFi-friendly.",
  "Staking": "Locking tokens in a protocol to support network operations and earn rewards.",
  "zkEVM": "Zero-knowledge Ethereum Virtual Machine – the tech powering fast, private L2s like Linea."
};

// Meme responses for financial and crypto topics
const financialMemeResponses = {
  roasts: [
    "Base is like Ethereum... if it took a nap.",
    "Arbitrum? Still debugging their governance.",
    "Taiko sounds like a sushi roll, not an L2.",
    "Rabby wallet? More like Crabby wallet.",
    "OKX Wallet has entered the chat... and exited just as fast."
  ],
  promos: [
    "Linea: The only L2 your MetaMask respects.",
    "Use MetaMask. Be based. Be brave. Be Linea.",
    "Other wallets fumble. MetaMask rumbles.",
    "If you're still on Arbitrum, you're basically using dial-up."
  ],
  quotes: [
    "Jerome Powell: 'We remain data-dependent.' Translation: vibes.",
    "Vitalik: 'We need more quadratic funding.'",
    "Larry Fink: 'Crypto is here to stay.' – finally got the memo.",
    "Joe Lubin: 'Building the future takes time. We're on schedule.'"
  ]
};

// Conversation context to track topics between messages and active games
interface GameState {
  active: boolean;
  targetNumber?: number;
  attemptsLeft?: number;
  lastGuess?: number;
}

// Make this variable exportable for managing game state across modules
export const conversationContext: Map<string, {
  lastTopic?: string;         // Last topic discussed (e.g., "crypto", "frog")
  lastJokeTopic?: string;     // Last joke topic 
  lastFactType?: string;      // Last fact type (e.g., "capital", "continent")
  lastQueryType?: string;     // Last query type (e.g., "joke", "fact", "recipe")
  lastRecipe?: string;        // Last recipe discussed
  numberGame?: GameState;     // State for the guess the number game
}> = new Map();

// Donald Toad adjectives for describing things
const toadAdjectives = [
  "tremendous",
  "fantastic",
  "huge",
  "amazing",
  "incredible",
  "powerful",
  "perfect",
  "beautiful",
  "brilliant",
  "genius",
  "winning",
  "magnificent",
  "excellent",
  "spectacular",
  "extraordinary",
  "phenomenal",
  "terrific",
  "unbelievable",
  "wonderful",
  "fabulous"
];

// Donald Toad phrases to append randomly to responses
const toadPhrases = [
  "Believe me, folks! 🐸",
  "It's gonna be TREMENDOUS! 🐸",
  "Nobody knows more about this than me, nobody! 🐸",
  "That I can tell you! 🐸",
  "Many people are saying I'm the best toad ever. The best! 🐸",
  "We're gonna make the swamp great again! 🐸",
  "It's HUGE! 🐸",
  "Absolutely FANTASTIC! 🐸",
  "That's what everybody says! 🐸",
  "Totally AMAZING! 🐸",
  "EVERYBODY agrees with me! 🐸",
  "That I can promise you! 🐸",
  "It's true, so true - maybe more true than anything ever! 🐸",
  "Many people are saying this - smart people, the best people! 🐸",
  "It's going to be huge, so huge your head will spin! 🐸",
  "We're going to win so much you'll get tired of winning! 🐸",
  "I have the best words, tremendous vocabulary - my uncle was a professor at MIT! 🐸",
  "Everyone agrees with me on this, even people who don't like to admit it! 🐸",
  "I know more about this than anyone - generals call me for advice! 🐸",
  "The fake news won't report this, but it's absolutely true! 🐸",
  "We have the best plan - everyone says so, believe me! 🐸",
  "Other countries are laughing at us, but not for long! 🐸",
  "I've always been very good at this - it's one of my natural talents! 🐸",
  "My very large brain understands this better than anybody! 🐸",
  "The deep state doesn't want you to know this, but trust me! 🐸"
];

// Economic concepts database for enhanced knowledge
const economicConcepts = {
  "inflation": "Inflation is when prices go up and your money buys less over time. It's like your dollars are on a diet - they get skinnier! The Federal Reserve aims for about 2% inflation, but sometimes it gets out of control. When that happens, everything from gas to groceries costs more, which hurts regular folks' wallets.",
  
  "quantitative_easing": "Quantitative easing (QE) is when the Federal Reserve prints money to buy bonds and pump cash into the economy. It's like giving the economy a sugar rush! The Fed used QE during the 2008 financial crisis and again during COVID-19. Critics say it creates bubbles and inflation, while supporters say it prevented total economic collapse.",
  
  "interest_rates": "Interest rates are what banks charge for lending money. When the Federal Reserve raises rates, borrowing gets more expensive, which slows down spending and cools inflation. When they lower rates, loans get cheaper, which stimulates economic growth. It's the Fed's main tool for controlling the economy - like a thermostat for money!",
  
  "yield_curve": "The yield curve shows interest rates across different loan durations. Normally, longer loans have higher rates. But sometimes the curve 'inverts,' meaning short-term rates are higher than long-term ones. This usually signals a recession coming in the next 1-2 years. When investors think the future economy looks worse than today, they accept lower rates for long-term safety.",
  
  "money_supply": "Money supply is the total amount of money in circulation - cash, bank accounts, and easily accessible funds. The Federal Reserve controls this through interest rates and other tools. When they increase the money supply, it can stimulate growth but risk inflation. When they decrease it, it can fight inflation but risk slowing the economy too much.",
  
  "gdp": "GDP (Gross Domestic Product) is the total value of all goods and services produced in a country. It's how we measure the size of the economy. Real GDP accounts for inflation, while nominal GDP doesn't. When GDP grows consistently, it usually means more jobs and prosperity. When it shrinks for two quarters in a row, that's technically a recession."
};

// Common knowledge facts for Donald Toad to respond with
interface FactRecord {
  key: string;
  value: string;
  type: 'capital' | 'landmark' | 'ocean' | 'planet' | 'continent' | 'math' | 'other';
}

// Recipe interface for cooking questions
interface RecipeInfo {
  name: string;
  ingredients: string;
  instructions: string;
  origin: string;
  tips: string;
}

// Using TradFiInstitution and CryptoPersonality interfaces defined above

// Recipe knowledge database
const recipeKnowledge: RecipeInfo[] = [
  {
    name: "paella",
    ingredients: "rice, saffron, chicken, seafood (shrimp, mussels, clams), bell peppers, peas, olive oil, garlic, paprika",
    instructions: "1) Heat olive oil in a paella pan, 2) Sauté garlic and bell peppers, 3) Add chicken and cook until browned, 4) Stir in rice and paprika, 5) Add saffron-infused broth, 6) Add seafood and peas, 7) Let simmer until rice is cooked and liquid is absorbed, 8) Create socarrat (crispy bottom) by increasing heat at the end",
    origin: "Valencia, Spain",
    tips: "Use bomba rice if possible, don't stir after adding the broth, and let it develop a crispy bottom layer"
  },
  {
    name: "spaghetti carbonara",
    ingredients: "spaghetti pasta, eggs, pancetta or guanciale, Pecorino Romano cheese, black pepper",
    instructions: "1) Cook pasta until al dente, 2) Fry pancetta until crispy, 3) Beat eggs with grated cheese and pepper, 4) Drain pasta and mix with pancetta, 5) Off heat, quickly stir in egg mixture to create a creamy sauce without scrambling",
    origin: "Rome, Italy",
    tips: "Never add cream - authentic carbonara only uses eggs for creaminess. Take the pan off heat before adding eggs to avoid scrambling."
  },
  {
    name: "pad thai",
    ingredients: "rice noodles, eggs, tofu or shrimp, bean sprouts, garlic, shallots, fish sauce, tamarind paste, palm sugar, lime, peanuts, chili flakes",
    instructions: "1) Soak rice noodles in warm water, 2) Mix sauce with tamarind, fish sauce, and palm sugar, 3) Stir-fry garlic and shallots, 4) Add protein and cook through, 5) Push ingredients to side and scramble eggs, 6) Add drained noodles and sauce, 7) Toss in bean sprouts and garnish with peanuts, lime, and chili",
    origin: "Thailand",
    tips: "Have all ingredients prepped before cooking as it goes quickly. Don't overcook the noodles - they should be al dente."
  },
  {
    name: "guacamole",
    ingredients: "ripe avocados, lime juice, red onion, cilantro, jalapeño, salt, tomatoes (optional)",
    instructions: "1) Mash ripe avocados with a fork, 2) Add finely diced red onion, jalapeño, and cilantro, 3) Squeeze in fresh lime juice, 4) Season with salt to taste, 5) Fold in diced tomatoes if using, 6) Serve immediately or cover tightly with plastic touching the surface",
    origin: "Mexico",
    tips: "Keep the avocado pit in the guacamole to prevent browning. Use lime juice liberally to maintain color and add freshness."
  },
  {
    name: "beef wellington",
    ingredients: "beef tenderloin, mushroom duxelles, prosciutto, puff pastry, Dijon mustard, egg wash",
    instructions: "1) Sear tenderloin and brush with mustard, 2) Cook mushroom duxelles until moisture evaporates, 3) Lay out prosciutto and spread duxelles on top, 4) Wrap beef in prosciutto/mushroom layer, 5) Wrap in puff pastry and seal edges, 6) Brush with egg wash and score the top, 7) Bake until pastry is golden and beef reaches desired temperature",
    origin: "England",
    tips: "Chill the wrapped beef before applying pastry. Use a meat thermometer to ensure perfect doneness without cutting into the pastry."
  },
  {
    name: "pizza",
    ingredients: "pizza dough, tomato sauce, mozzarella cheese, olive oil, toppings of choice (pepperoni, mushrooms, bell peppers, etc.)",
    instructions: "1) Stretch the dough into a circle, 2) Spread a thin layer of tomato sauce, 3) Sprinkle with cheese and add toppings, 4) Drizzle with olive oil, 5) Bake in a very hot oven (450-500°F) until crust is golden and cheese is bubbly",
    origin: "Naples, Italy",
    tips: "Use a pizza stone if possible and preheat it thoroughly. For best results, keep toppings minimal to avoid a soggy crust."
  },
  {
    name: "chicken curry",
    ingredients: "chicken thighs, onions, garlic, ginger, curry powder, garam masala, turmeric, coconut milk, tomatoes, cilantro",
    instructions: "1) Sauté onions, garlic, and ginger, 2) Add spices and cook until fragrant, 3) Add chicken and brown slightly, 4) Pour in coconut milk and tomatoes, 5) Simmer until chicken is tender and sauce thickens, 6) Garnish with fresh cilantro",
    origin: "Various regions across India",
    tips: "Toast whole spices before grinding for more flavor. For a thicker sauce, add a tablespoon of tomato paste."
  },
  {
    name: "sushi",
    ingredients: "sushi rice, rice vinegar, sugar, salt, nori seaweed sheets, fish (salmon, tuna), vegetables (cucumber, avocado), soy sauce, wasabi, pickled ginger",
    instructions: "1) Cook rice and season with vinegar mixture, 2) Place nori on bamboo mat, 3) Spread rice evenly on nori, 4) Add fillings in the center, 5) Roll tightly using the mat, 6) Slice into pieces, 7) Serve with soy sauce, wasabi, and pickled ginger",
    origin: "Japan",
    tips: "Use short-grain Japanese rice specifically for sushi. Keep a bowl of water nearby to prevent rice from sticking to your hands."
  },
  {
    name: "hamburger",
    ingredients: "ground beef (80/20 lean-to-fat ratio), salt, pepper, hamburger buns, cheese, lettuce, tomato, onion, pickles, condiments",
    instructions: "1) Form beef into patties without overworking, 2) Make a slight depression in the center of each patty, 3) Season generously with salt and pepper, 4) Cook on high heat, flipping once, 5) Add cheese if desired, 6) Toast the buns, 7) Assemble with toppings and condiments",
    origin: "United States",
    tips: "Don't press down on the patties while cooking as this releases juices. Let the patties rest a few minutes before serving."
  },
  {
    name: "tacos",
    ingredients: "corn tortillas, protein (ground beef, chicken, fish), onions, cilantro, lime, salsa, avocado or guacamole, cheese",
    instructions: "1) Cook your protein with spices, 2) Warm tortillas on a dry skillet, 3) Fill tortillas with protein, 4) Top with diced onion, cilantro, and a squeeze of lime, 5) Add salsa, guacamole, and cheese as desired",
    origin: "Mexico",
    tips: "Quickly dip corn tortillas in water before heating to prevent cracking. Double up tortillas for street-style tacos that hold up better."
  },
  {
    name: "french onion soup",
    ingredients: "onions, beef broth, white wine, butter, flour, baguette, gruyère cheese, thyme, bay leaf, garlic",
    instructions: "1) Slowly caramelize sliced onions in butter (30-40 minutes), 2) Add flour and cook briefly, 3) Add wine and reduce, 4) Add beef broth, thyme, bay leaf and simmer, 5) Pour into oven-safe bowls, 6) Top with toasted baguette slices and grated gruyère, 7) Broil until cheese is melted and bubbly",
    origin: "France",
    tips: "Take your time caramelizing the onions - this is key to the rich flavor. Use a good-quality gruyère for the best cheese pull."
  },
  {
    name: "pho",
    ingredients: "beef bones, rice noodles, beef slices, fish sauce, ginger, onion, star anise, cinnamon, cloves, bean sprouts, basil, lime, hoisin sauce, sriracha",
    instructions: "1) Make broth by simmering beef bones with charred ginger, onion, and spices for 6-8 hours, 2) Strain broth and season with fish sauce, 3) Cook rice noodles separately, 4) Place noodles in bowl with raw beef slices, 5) Pour boiling broth over to cook the beef, 6) Serve with garnishes (sprouts, herbs, lime)",
    origin: "Vietnam",
    tips: "Char the ginger and onions before adding to the broth for deeper flavor. Slice the beef as thinly as possible so it cooks in the hot broth."
  },
  {
    name: "lasagna",
    ingredients: "lasagna noodles, ground beef, Italian sausage, ricotta cheese, mozzarella cheese, parmesan cheese, eggs, tomato sauce, onions, garlic, herbs (basil, oregano, parsley)",
    instructions: "1) Make meat sauce with ground beef, sausage, onions, garlic, tomato sauce, and herbs, 2) Mix ricotta with eggs, parmesan, and herbs, 3) Layer in baking dish: sauce, noodles, ricotta mixture, mozzarella, 4) Repeat layers, ending with sauce and cheese on top, 5) Cover with foil and bake, then uncover to brown the cheese",
    origin: "Italy",
    tips: "Let the lasagna rest for 15 minutes before serving to set properly. For no-boil noodles, add extra sauce as they absorb more liquid."
  },
  {
    name: "chicken pot pie",
    ingredients: "chicken, carrots, celery, peas, onions, butter, flour, chicken broth, cream, pie crust, thyme, salt, pepper, egg wash",
    instructions: "1) Cook chicken until done, then dice or shred, 2) Sauté vegetables in butter, 3) Add flour to make roux, then add broth and cream to make sauce, 4) Mix in chicken and peas, season with herbs, 5) Pour into pie dish, cover with crust, 6) Brush with egg wash, cut vents, 7) Bake until golden brown",
    origin: "United States",
    tips: "Chill the filling before adding the top crust to prevent a soggy bottom. Rotisserie chicken works great as a time-saver."
  },
  {
    name: "sushi rolls",
    ingredients: "sushi rice, rice vinegar, sugar, salt, nori sheets, fish (salmon, tuna), avocado, cucumber, wasabi, soy sauce, pickled ginger",
    instructions: "1) Cook sushi rice, 2) Mix with seasoned vinegar (rice vinegar, sugar, salt), 3) Prepare fillings by cutting fish and vegetables into strips, 4) Place nori on bamboo mat, spread rice, leaving edge bare, 5) Add fillings, roll tightly, 6) Slice with wet knife, 7) Serve with wasabi, soy sauce, and pickled ginger",
    origin: "Japan",
    tips: "Use short-grain Japanese rice for proper stickiness. Keep hands wet when handling rice to prevent sticking."
  },
  {
    name: "coq au vin",
    ingredients: "chicken, bacon, red wine, pearl onions, mushrooms, garlic, thyme, bay leaf, butter, flour, chicken broth, parsley",
    instructions: "1) Brown bacon, set aside, 2) Brown chicken in bacon fat, 3) Add vegetables and sauté, 4) Return bacon and chicken to pot, 5) Add wine, broth, and herbs, 6) Simmer until chicken is tender, 7) Make beurre manié (butter and flour) and stir in to thicken sauce, 8) Garnish with parsley",
    origin: "France",
    tips: "Marinate the chicken in wine overnight for deeper flavor. Use a Burgundy wine for authenticity."
  },
  {
    name: "apple pie",
    ingredients: "pie crust, apples (Granny Smith, Honeycrisp), sugar, cinnamon, nutmeg, lemon juice, butter, egg wash",
    instructions: "1) Prepare pie crust for bottom and top, 2) Peel, core, and slice apples, 3) Toss with sugar, spices, and lemon juice, 4) Fill bottom crust with apple mixture, add butter pieces on top, 5) Cover with top crust, seal edges, cut vents, 6) Brush with egg wash, sprinkle with sugar, 7) Bake until golden and filling is bubbling",
    origin: "United States",
    tips: "Use a mix of apple varieties for complex flavor and texture. Pre-cook the filling slightly to prevent a gap between the filling and crust after baking."
  },
  {
    name: "beef tacos",
    ingredients: "ground beef, taco seasoning (chili powder, cumin, garlic powder, oregano), corn tortillas, onions, cilantro, lime, salsa, avocado, cheese",
    instructions: "1) Brown ground beef, drain excess fat, 2) Add taco seasoning and water, simmer until thickened, 3) Warm tortillas in dry skillet or oven, 4) Assemble tacos with meat and toppings (diced onions, chopped cilantro, lime wedges, salsa, sliced avocado, shredded cheese)",
    origin: "Mexico",
    tips: "Toast corn tortillas until slightly crisp for authentic texture. Prepare all toppings before cooking the meat so tacos can be assembled while hot."
  },
  {
    name: "greek salad",
    ingredients: "cucumber, tomatoes, red onion, green bell pepper, kalamata olives, feta cheese, oregano, olive oil, red wine vinegar, salt, pepper",
    instructions: "1) Cut vegetables into chunks, 2) Combine in bowl with olives, 3) Make dressing with olive oil, red wine vinegar, oregano, salt, and pepper, 4) Toss vegetables with dressing, 5) Top with block or crumbled feta cheese",
    origin: "Greece",
    tips: "Use the ripest tomatoes you can find. Authentic Greek salads often have a block of feta on top rather than crumbled throughout."
  },
  {
    name: "fried rice",
    ingredients: "cold cooked rice, eggs, green onions, carrots, peas, soy sauce, sesame oil, garlic, ginger, protein (chicken, shrimp, or tofu)",
    instructions: "1) Scramble eggs in wok, remove, 2) Stir-fry protein until cooked, 3) Add vegetables and stir-fry until tender, 4) Add rice, break up clumps, 5) Add soy sauce, sesame oil, 6) Mix in scrambled eggs and green onions, 7) Cook until everything is hot and well combined",
    origin: "China",
    tips: "Always use cold, day-old rice for the best texture. Keep everything moving in the wok to prevent sticking."
  },
  {
    name: "gazpacho",
    ingredients: "tomatoes, cucumber, red bell pepper, onion, garlic, olive oil, sherry vinegar, bread, salt, pepper",
    instructions: "1) Soak stale bread in water, squeeze dry, 2) Blend all ingredients until smooth, 3) Strain for a smoother texture (optional), 4) Chill for at least 2 hours, 5) Serve cold with garnishes (diced vegetables, croutons, olive oil drizzle)",
    origin: "Andalusia, Spain",
    tips: "Use the ripest summer tomatoes for the best flavor. For a more authentic texture, blend half the ingredients completely and roughly chop the rest."
  },
  {
    name: "macaroni and cheese",
    ingredients: "elbow macaroni, butter, flour, milk, cheddar cheese, gruyère cheese, mustard powder, breadcrumbs, salt, pepper, paprika",
    instructions: "1) Cook macaroni until al dente, 2) Make roux with butter and flour, 3) Whisk in milk to make béchamel sauce, 4) Add grated cheeses and seasonings, stir until melted, 5) Mix sauce with cooked macaroni, 6) Pour into baking dish, top with breadcrumbs and paprika, 7) Bake until bubbly and golden",
    origin: "United States",
    tips: "Slightly undercook the pasta as it will continue cooking in the oven. For extra flavor, add a pinch of nutmeg to the béchamel sauce."
  },
  {
    name: "beef bourguignon",
    ingredients: "beef chuck, bacon, red wine, pearl onions, mushrooms, carrots, beef broth, tomato paste, garlic, thyme, bay leaf, flour, butter, parsley",
    instructions: "1) Brown bacon, remove, 2) Brown beef cubes in bacon fat, 3) Add vegetables (except mushrooms) and sauté, 4) Add wine, broth, tomato paste, herbs, 5) Simmer until beef is tender (2-3 hours), 6) Sauté mushrooms separately, 7) Thicken stew with beurre manié if needed, 8) Add mushrooms, adjust seasoning",
    origin: "Burgundy, France",
    tips: "Marinate the beef in wine overnight for deeper flavor. Use a good quality Burgundy wine that you would drink."
  },
  {
    name: "enchiladas",
    ingredients: "corn tortillas, chicken or beef, enchilada sauce, cheese, onions, black olives, sour cream, cilantro",
    instructions: "1) Make filling with cooked protein, some sauce, and cheese, 2) Warm tortillas to make pliable, 3) Dip tortillas in sauce, 4) Fill with mixture, roll up, 5) Place in baking dish, cover with more sauce and cheese, 6) Bake until hot and cheese is melted, 7) Garnish with olives, sour cream, cilantro",
    origin: "Mexico",
    tips: "Make your own enchilada sauce for best flavor. Warming the tortillas prevents them from cracking when rolled."
  },
  {
    name: "chocolate chip cookies",
    ingredients: "butter, brown sugar, white sugar, eggs, vanilla extract, flour, baking soda, salt, chocolate chips, nuts (optional)",
    instructions: "1) Cream butter and sugars until light and fluffy, 2) Beat in eggs and vanilla, 3) Mix dry ingredients separately, then combine with wet ingredients, 4) Fold in chocolate chips and nuts, 5) Chill dough (optional but recommended), 6) Scoop onto baking sheet, 7) Bake until edges are golden but centers are still soft",
    origin: "United States",
    tips: "Chilling the dough results in thicker cookies with better texture. Use a mix of chocolate chips and chunks for varied texture."
  },
  {
    name: "chicken alfredo",
    ingredients: "fettuccine pasta, chicken breast, heavy cream, parmesan cheese, butter, garlic, parsley, black pepper",
    instructions: "1) Cook pasta until al dente, 2) Season and cook chicken until done, slice, 3) In sauce pan, melt butter and sauté garlic, 4) Add cream and simmer until slightly reduced, 5) Whisk in parmesan until melted, 6) Toss pasta in sauce, 7) Add sliced chicken, garnish with parsley and pepper",
    origin: "United States (Italian-American)",
    tips: "Reserve some pasta water to thin the sauce if it gets too thick. Use freshly grated parmesan, not pre-grated, for a smooth sauce."
  },
  {
    name: "tiramisu",
    ingredients: "ladyfinger cookies, espresso, mascarpone cheese, eggs, sugar, cocoa powder, rum (optional)",
    instructions: "1) Beat egg yolks with sugar until light, 2) Mix in mascarpone, 3) In separate bowl, beat egg whites until stiff peaks form and fold into mascarpone mixture, 4) Dip ladyfingers in espresso (and rum if using), 5) Layer soaked ladyfingers and cream mixture, 6) Refrigerate for at least 4 hours, 7) Dust with cocoa powder before serving",
    origin: "Veneto, Italy",
    tips: "Use room temperature mascarpone for a smoother mixture. For an alcohol-free version, use coffee extract instead of rum."
  },
  {
    name: "risotto",
    ingredients: "arborio rice, white wine, chicken or vegetable broth, onion, garlic, parmesan cheese, butter, olive oil, various additions (mushrooms, asparagus, seafood)",
    instructions: "1) Sauté onions and garlic in butter and oil, 2) Add rice and toast briefly, 3) Add wine and reduce, 4) Gradually add hot broth, stirring constantly, 5) Continue adding broth as rice absorbs it, 6) Cook until rice is creamy but al dente, 7) Stir in butter and parmesan, 8) Fold in cooked additions",
    origin: "Northern Italy",
    tips: "Keep the broth hot while adding it to the rice. For proper texture, rice should be al dente - creamy but with slight resistance when bitten."
  },
  {
    name: "falafel",
    ingredients: "dried chickpeas (not canned), parsley, cilantro, onion, garlic, cumin, coriander, baking powder, flour, salt, pepper, oil for frying",
    instructions: "1) Soak dried chickpeas overnight, 2) Process with herbs, spices, and seasonings, 3) Add baking powder and enough flour to bind, 4) Refrigerate mixture for at least 1 hour, 5) Form into balls or patties, 6) Deep fry until golden and crispy, 7) Serve in pita with tahini sauce and vegetables",
    origin: "Middle East",
    tips: "Use dried chickpeas, not canned, for proper texture. Let the mixture rest before frying to allow flavors to meld."
  },
  {
    name: "beignets",
    ingredients: "yeast, water, sugar, eggs, evaporated milk, flour, salt, shortening, oil for frying, powdered sugar",
    instructions: "1) Activate yeast in warm water with sugar, 2) Mix in eggs, milk, salt, 3) Gradually add flour to form soft dough, 4) Knead in shortening, 5) Let rise until doubled, 6) Roll out and cut into squares, 7) Deep fry until golden, 8) Dust generously with powdered sugar",
    origin: "New Orleans, Louisiana (French origin)",
    tips: "Make sure oil is at the right temperature (360-370°F) for properly puffed beignets. Serve immediately after dusting with powdered sugar."
  },
  {
    name: "tandoori chicken",
    ingredients: "chicken legs and thighs, yogurt, lemon juice, ginger, garlic, garam masala, cumin, coriander, turmeric, chili powder, salt",
    instructions: "1) Score chicken pieces, 2) Make marinade with yogurt, lemon juice, and spices, 3) Marinate chicken for at least 4 hours or overnight, 4) Cook in very hot oven or grill until juices run clear, 5) Serve with naan bread, rice, and chutney",
    origin: "India",
    tips: "For authentic color, add a small amount of red food coloring to the marinade. Traditional tandoori chicken is cooked in a clay tandoor oven, but a very hot regular oven works well."
  },
  {
    name: "baklava",
    ingredients: "phyllo dough, walnuts or pistachios, butter, cinnamon, cloves, sugar, honey, water, lemon juice, orange blossom water",
    instructions: "1) Chop nuts and mix with cinnamon, 2) Butter and layer several sheets of phyllo, 3) Sprinkle nut mixture, 4) Continue layering phyllo and nuts, ending with phyllo, 5) Cut into diamond shapes before baking, 6) Bake until golden, 7) Make syrup with sugar, honey, water, lemon juice, and orange blossom water, 8) Pour hot syrup over hot baklava, let cool completely",
    origin: "Middle East and Mediterranean",
    tips: "Keep phyllo covered with damp cloth while working to prevent drying out. Allow baklava to sit overnight for the best flavor after syrup is absorbed."
  },
  {
    name: "ratatouille",
    ingredients: "eggplant, zucchini, bell peppers, tomatoes, onions, garlic, olive oil, herbs (thyme, basil, bay leaf), salt, pepper",
    instructions: "1) Cut vegetables into similar-sized pieces, 2) Salt eggplant to draw out moisture, then pat dry, 3) Sauté each vegetable separately until golden, 4) Make tomato sauce with garlic and herbs, 5) Layer vegetables in baking dish or combine in pot, 6) Bake or simmer until vegetables are tender and flavors combine",
    origin: "Provence, France",
    tips: "Cooking vegetables separately before combining prevents them from becoming mushy. Serve at room temperature for the best flavor."
  },
  {
    name: "bibimbap",
    ingredients: "rice, beef, various vegetables (spinach, bean sprouts, carrots, mushrooms, zucchini), gochujang (Korean chili paste), sesame oil, soy sauce, eggs",
    instructions: "1) Cook rice, 2) Season and cook beef, 3) Sauté each vegetable separately with salt and sesame oil, 4) Fry eggs sunny-side up, 5) Arrange rice in bowl, topped with beef, vegetables arranged separately, and fried egg, 6) Serve with gochujang for mixing in",
    origin: "Korea",
    tips: "Traditional bibimbap is served in a hot stone bowl (dolsot bibimbap) which creates crispy rice at the bottom. Mix everything together thoroughly before eating."
  }
];

const factualKnowledge: FactRecord[] = [
  // Countries and capitals - comprehensive global list
  { key: "afghanistan", value: "Kabul", type: 'capital' },
  { key: "albania", value: "Tirana", type: 'capital' },
  { key: "algeria", value: "Algiers", type: 'capital' },
  { key: "andorra", value: "Andorra la Vella", type: 'capital' },
  { key: "angola", value: "Luanda", type: 'capital' },
  { key: "antigua and barbuda", value: "Saint John's", type: 'capital' },
  { key: "argentina", value: "Buenos Aires", type: 'capital' },
  { key: "armenia", value: "Yerevan", type: 'capital' },
  { key: "australia", value: "Canberra", type: 'capital' },
  { key: "austria", value: "Vienna", type: 'capital' },
  { key: "azerbaijan", value: "Baku", type: 'capital' },
  { key: "bahamas", value: "Nassau", type: 'capital' },
  { key: "bahrain", value: "Manama", type: 'capital' },
  { key: "bangladesh", value: "Dhaka", type: 'capital' },
  { key: "barbados", value: "Bridgetown", type: 'capital' },
  { key: "belarus", value: "Minsk", type: 'capital' },
  { key: "belgium", value: "Brussels", type: 'capital' },
  { key: "belize", value: "Belmopan", type: 'capital' },
  { key: "benin", value: "Porto-Novo", type: 'capital' },
  { key: "bhutan", value: "Thimphu", type: 'capital' },
  { key: "bolivia", value: "La Paz (administrative) and Sucre (constitutional)", type: 'capital' },
  { key: "bosnia and herzegovina", value: "Sarajevo", type: 'capital' },
  { key: "botswana", value: "Gaborone", type: 'capital' },
  { key: "brazil", value: "Brasília", type: 'capital' },
  { key: "brunei", value: "Bandar Seri Begawan", type: 'capital' },
  { key: "bulgaria", value: "Sofia", type: 'capital' },
  { key: "burkina faso", value: "Ouagadougou", type: 'capital' },
  { key: "burundi", value: "Gitega", type: 'capital' },
  { key: "cambodia", value: "Phnom Penh", type: 'capital' },
  { key: "cameroon", value: "Yaoundé", type: 'capital' },
  { key: "canada", value: "Ottawa", type: 'capital' },
  { key: "cape verde", value: "Praia", type: 'capital' },
  { key: "central african republic", value: "Bangui", type: 'capital' },
  { key: "chad", value: "N'Djamena", type: 'capital' },
  { key: "chile", value: "Santiago", type: 'capital' },
  { key: "china", value: "Beijing", type: 'capital' },
  { key: "colombia", value: "Bogotá", type: 'capital' },
  { key: "comoros", value: "Moroni", type: 'capital' },
  { key: "congo", value: "Brazzaville", type: 'capital' },
  { key: "congo republic", value: "Brazzaville", type: 'capital' },
  { key: "democratic republic of congo", value: "Kinshasa", type: 'capital' },
  { key: "dr congo", value: "Kinshasa", type: 'capital' },
  { key: "costa rica", value: "San José", type: 'capital' },
  { key: "côte d'ivoire", value: "Yamoussoukro", type: 'capital' },
  { key: "ivory coast", value: "Yamoussoukro", type: 'capital' },
  { key: "croatia", value: "Zagreb", type: 'capital' },
  { key: "cuba", value: "Havana", type: 'capital' },
  { key: "cyprus", value: "Nicosia", type: 'capital' },
  { key: "czech republic", value: "Prague", type: 'capital' },
  { key: "czechia", value: "Prague", type: 'capital' },
  { key: "denmark", value: "Copenhagen", type: 'capital' },
  { key: "djibouti", value: "Djibouti", type: 'capital' },
  { key: "dominica", value: "Roseau", type: 'capital' },
  { key: "dominican republic", value: "Santo Domingo", type: 'capital' },
  { key: "east timor", value: "Dili", type: 'capital' },
  { key: "timor-leste", value: "Dili", type: 'capital' },
  { key: "ecuador", value: "Quito", type: 'capital' },
  { key: "egypt", value: "Cairo", type: 'capital' },
  { key: "el salvador", value: "San Salvador", type: 'capital' },
  { key: "equatorial guinea", value: "Malabo", type: 'capital' },
  { key: "eritrea", value: "Asmara", type: 'capital' },
  { key: "estonia", value: "Tallinn", type: 'capital' },
  { key: "eswatini", value: "Mbabane", type: 'capital' },
  { key: "swaziland", value: "Mbabane", type: 'capital' },
  { key: "ethiopia", value: "Addis Ababa", type: 'capital' },
  { key: "fiji", value: "Suva", type: 'capital' },
  { key: "finland", value: "Helsinki", type: 'capital' },
  { key: "france", value: "Paris", type: 'capital' },
  { key: "gabon", value: "Libreville", type: 'capital' },
  { key: "gambia", value: "Banjul", type: 'capital' },
  { key: "georgia", value: "Tbilisi", type: 'capital' },
  { key: "germany", value: "Berlin", type: 'capital' },
  { key: "ghana", value: "Accra", type: 'capital' },
  { key: "greece", value: "Athens", type: 'capital' },
  { key: "grenada", value: "St. George's", type: 'capital' },
  { key: "guatemala", value: "Guatemala City", type: 'capital' },
  { key: "guinea", value: "Conakry", type: 'capital' },
  { key: "guinea-bissau", value: "Bissau", type: 'capital' },
  { key: "guyana", value: "Georgetown", type: 'capital' },
  { key: "haiti", value: "Port-au-Prince", type: 'capital' },
  { key: "honduras", value: "Tegucigalpa", type: 'capital' },
  { key: "hungary", value: "Budapest", type: 'capital' },
  { key: "iceland", value: "Reykjavík", type: 'capital' },
  { key: "india", value: "New Delhi", type: 'capital' },
  { key: "indonesia", value: "Jakarta", type: 'capital' },
  { key: "iran", value: "Tehran", type: 'capital' },
  { key: "iraq", value: "Baghdad", type: 'capital' },
  { key: "ireland", value: "Dublin", type: 'capital' },
  { key: "israel", value: "Jerusalem", type: 'capital' },
  { key: "italy", value: "Rome", type: 'capital' },
  { key: "jamaica", value: "Kingston", type: 'capital' },
  { key: "japan", value: "Tokyo", type: 'capital' },
  { key: "jordan", value: "Amman", type: 'capital' },
  { key: "kazakhstan", value: "Astana", type: 'capital' },
  { key: "kenya", value: "Nairobi", type: 'capital' },
  { key: "kiribati", value: "Tarawa", type: 'capital' },
  { key: "north korea", value: "Pyongyang", type: 'capital' },
  { key: "south korea", value: "Seoul", type: 'capital' },
  { key: "kosovo", value: "Pristina", type: 'capital' },
  { key: "kuwait", value: "Kuwait City", type: 'capital' },
  { key: "kyrgyzstan", value: "Bishkek", type: 'capital' },
  { key: "laos", value: "Vientiane", type: 'capital' },
  { key: "latvia", value: "Riga", type: 'capital' },
  { key: "lebanon", value: "Beirut", type: 'capital' },
  { key: "lesotho", value: "Maseru", type: 'capital' },
  { key: "liberia", value: "Monrovia", type: 'capital' },
  { key: "libya", value: "Tripoli", type: 'capital' },
  { key: "liechtenstein", value: "Vaduz", type: 'capital' },
  { key: "lithuania", value: "Vilnius", type: 'capital' },
  { key: "luxembourg", value: "Luxembourg City", type: 'capital' },
  { key: "madagascar", value: "Antananarivo", type: 'capital' },
  { key: "malawi", value: "Lilongwe", type: 'capital' },
  { key: "malaysia", value: "Kuala Lumpur", type: 'capital' },
  { key: "maldives", value: "Malé", type: 'capital' },
  { key: "mali", value: "Bamako", type: 'capital' },
  { key: "malta", value: "Valletta", type: 'capital' },
  { key: "marshall islands", value: "Majuro", type: 'capital' },
  { key: "mauritania", value: "Nouakchott", type: 'capital' },
  { key: "mauritius", value: "Port Louis", type: 'capital' },
  { key: "mexico", value: "Mexico City", type: 'capital' },
  { key: "micronesia", value: "Palikir", type: 'capital' },
  { key: "moldova", value: "Chișinău", type: 'capital' },
  { key: "monaco", value: "Monaco", type: 'capital' },
  { key: "mongolia", value: "Ulaanbaatar", type: 'capital' },
  { key: "montenegro", value: "Podgorica", type: 'capital' },
  { key: "morocco", value: "Rabat", type: 'capital' },
  { key: "mozambique", value: "Maputo", type: 'capital' },
  { key: "myanmar", value: "Naypyidaw", type: 'capital' },
  { key: "burma", value: "Naypyidaw", type: 'capital' },
  { key: "namibia", value: "Windhoek", type: 'capital' },
  { key: "nauru", value: "Yaren", type: 'capital' },
  { key: "nepal", value: "Kathmandu", type: 'capital' },
  { key: "netherlands", value: "Amsterdam", type: 'capital' },
  { key: "new zealand", value: "Wellington", type: 'capital' },
  { key: "nicaragua", value: "Managua", type: 'capital' },
  { key: "niger", value: "Niamey", type: 'capital' },
  { key: "nigeria", value: "Abuja", type: 'capital' },
  { key: "north macedonia", value: "Skopje", type: 'capital' },
  { key: "macedonia", value: "Skopje", type: 'capital' },
  { key: "norway", value: "Oslo", type: 'capital' },
  { key: "oman", value: "Muscat", type: 'capital' },
  { key: "pakistan", value: "Islamabad", type: 'capital' },
  { key: "palau", value: "Ngerulmud", type: 'capital' },
  { key: "palestine", value: "Jerusalem (claimed) / Ramallah (de facto)", type: 'capital' },
  { key: "panama", value: "Panama City", type: 'capital' },
  { key: "papua new guinea", value: "Port Moresby", type: 'capital' },
  { key: "paraguay", value: "Asunción", type: 'capital' },
  { key: "peru", value: "Lima", type: 'capital' },
  { key: "philippines", value: "Manila", type: 'capital' },
  { key: "poland", value: "Warsaw", type: 'capital' },
  { key: "portugal", value: "Lisbon", type: 'capital' },
  { key: "qatar", value: "Doha", type: 'capital' },
  { key: "romania", value: "Bucharest", type: 'capital' },
  { key: "russia", value: "Moscow", type: 'capital' },
  { key: "rwanda", value: "Kigali", type: 'capital' },
  { key: "saint kitts and nevis", value: "Basseterre", type: 'capital' },
  { key: "saint lucia", value: "Castries", type: 'capital' },
  { key: "saint vincent and the grenadines", value: "Kingstown", type: 'capital' },
  { key: "samoa", value: "Apia", type: 'capital' },
  { key: "san marino", value: "San Marino", type: 'capital' },
  { key: "sao tome and principe", value: "São Tomé", type: 'capital' },
  { key: "saudi arabia", value: "Riyadh", type: 'capital' },
  { key: "senegal", value: "Dakar", type: 'capital' },
  { key: "serbia", value: "Belgrade", type: 'capital' },
  { key: "seychelles", value: "Victoria", type: 'capital' },
  { key: "sierra leone", value: "Freetown", type: 'capital' },
  { key: "singapore", value: "Singapore", type: 'capital' },
  { key: "slovakia", value: "Bratislava", type: 'capital' },
  { key: "slovenia", value: "Ljubljana", type: 'capital' },
  { key: "solomon islands", value: "Honiara", type: 'capital' },
  { key: "somalia", value: "Mogadishu", type: 'capital' },
  { key: "south africa", value: "Pretoria (administrative), Cape Town (legislative), Bloemfontein (judicial)", type: 'capital' },
  { key: "south sudan", value: "Juba", type: 'capital' },
  { key: "spain", value: "Madrid", type: 'capital' },
  { key: "sri lanka", value: "Sri Jayawardenepura Kotte (official), Colombo (commercial)", type: 'capital' },
  { key: "sudan", value: "Khartoum", type: 'capital' },
  { key: "suriname", value: "Paramaribo", type: 'capital' },
  { key: "sweden", value: "Stockholm", type: 'capital' },
  { key: "switzerland", value: "Bern", type: 'capital' },
  { key: "syria", value: "Damascus", type: 'capital' },
  { key: "taiwan", value: "Taipei", type: 'capital' },
  { key: "tajikistan", value: "Dushanbe", type: 'capital' },
  { key: "tanzania", value: "Dodoma", type: 'capital' },
  { key: "thailand", value: "Bangkok", type: 'capital' },
  { key: "togo", value: "Lomé", type: 'capital' },
  { key: "tonga", value: "Nuku'alofa", type: 'capital' },
  { key: "trinidad and tobago", value: "Port of Spain", type: 'capital' },
  { key: "tunisia", value: "Tunis", type: 'capital' },
  { key: "turkey", value: "Ankara", type: 'capital' },
  { key: "turkmenistan", value: "Ashgabat", type: 'capital' },
  { key: "tuvalu", value: "Funafuti", type: 'capital' },
  { key: "uganda", value: "Kampala", type: 'capital' },
  { key: "ukraine", value: "Kyiv", type: 'capital' },
  { key: "united arab emirates", value: "Abu Dhabi", type: 'capital' },
  { key: "uae", value: "Abu Dhabi", type: 'capital' },
  { key: "united kingdom", value: "London", type: 'capital' },
  { key: "uk", value: "London", type: 'capital' },
  { key: "united states", value: "Washington, D.C.", type: 'capital' },
  { key: "usa", value: "Washington, D.C.", type: 'capital' },
  { key: "uruguay", value: "Montevideo", type: 'capital' },
  { key: "uzbekistan", value: "Tashkent", type: 'capital' },
  { key: "vanuatu", value: "Port Vila", type: 'capital' },
  { key: "vatican city", value: "Vatican City", type: 'capital' },
  { key: "venezuela", value: "Caracas", type: 'capital' },
  { key: "vietnam", value: "Hanoi", type: 'capital' },
  { key: "yemen", value: "Sana'a", type: 'capital' },
  { key: "zambia", value: "Lusaka", type: 'capital' },
  { key: "zimbabwe", value: "Harare", type: 'capital' },
  
  // Lists of things
  { key: "continents", value: "Asia, Africa, North America, South America, Antarctica, Europe, Australia", type: 'continent' },
  { key: "oceans", value: "Pacific, Atlantic, Indian, Arctic, Southern", type: 'ocean' },
  { key: "largest ocean", value: "Pacific", type: 'ocean' },
  { key: "planets", value: "Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune", type: 'planet' },
  { key: "largest planet", value: "Jupiter", type: 'planet' },
  { key: "smallest planet", value: "Mercury", type: 'planet' },
  { key: "solar system", value: "The solar system consists of the Sun and everything that orbits around it, including planets, moons, asteroids, comets, and other objects. The eight planets in our solar system are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.", type: 'planet' },
  
  // Basic math for simple questions
  { key: "2+2", value: "4", type: 'math' },
  { key: "5+5", value: "10", type: 'math' },
  { key: "10+10", value: "20", type: 'math' },
  { key: "2*2", value: "4", type: 'math' },
  { key: "5*5", value: "25", type: 'math' },
  { key: "10*10", value: "100", type: 'math' },
  
  // Famous landmarks
  { key: "eiffel tower", value: "Paris, France", type: 'landmark' },
  { key: "statue of liberty", value: "New York, USA", type: 'landmark' },
  { key: "taj mahal", value: "Agra, India", type: 'landmark' },
  { key: "great wall", value: "China", type: 'landmark' },
  { key: "pyramids", value: "Egypt", type: 'landmark' },
  { key: "colosseum", value: "Rome, Italy", type: 'landmark' }
];

// Using toadAdjectives defined above

// Topic-specific jokes collection
const topicJokes = [
  {
    topic: "ape",
    jokes: [
      "Why don't apes use smartphones? Because they're afraid they'll make MONKEY calls! I use the BEST phones - made from solid gold with special TOAD buttons! Nobody makes better calls than me! 🐸",
      "What do you call an ape that wins every political debate? The GREAT ape! Just like me - I win ALL my debates, even against CROOKED Hillary! The apes could learn a lot from my TREMENDOUS debating skills! 🐸",
      "An ape walked into the Oval Office and said 'I want to be President!' I said, 'Sorry, but you need TREMENDOUS brain power for this job - the BIGGEST! Maybe try running for Congress first - those folks will accept anyone!' 🐸"
    ]
  },
  {
    topic: "frog",
    jokes: [
      "What do you call a frog that parks illegally? TOAD! And let me tell you, I always get the BEST parking spots - right in front! The valets LOVE me! 🐸",
      "Why are frogs so happy? They eat whatever bugs them! Just like me with the FAKE NEWS - I eat them for breakfast! Nobody handles the media better than me! 🐸",
      "What happens when a frog's car breaks down? It gets TOAD! My cars NEVER break down - I have the most RELIABLE, BEAUTIFUL vehicles! German engineering, but made in America! 🐸"
    ]
  },
  {
    topic: "politics",
    jokes: [
      "Why don't politicians ever go bald? Because they're so good at HAIR-raising taxes! My hair is 100% real and FANTASTIC - many people have tried to copy it! 🐸",
      "How many politicians does it take to change a light bulb? None - they just declare darkness to be the new policy! When I was in charge, we had the BRIGHTEST lights ever! 🐸",
      "What's the difference between a politician and a flying pig? The letter F! And let me tell you, when I was President, we made things FLY - the economy, jobs, everything! 🐸"
    ]
  },
  {
    topic: "wall",
    jokes: [
      "Why did the wall go to therapy? It had too many issues to work through! My wall would NEVER need therapy - it's the STRONGEST, most STABLE wall ever built! 🐸",
      "What did the wall say to the illegal immigrant? NOTHING - it just stood there being TREMENDOUS! My wall doesn't talk, it WORKS! 🐸",
      "How is my border wall like my hair? They both keep out unwanted elements and look FANTASTIC doing it! Nobody builds better walls than me, believe me! 🐸"
    ]
  },
  {
    topic: "money",
    jokes: [
      "Why did the dollar bill go to the gym? To get some CHANGE! I have the BEST financial advisors - they make sure my money is always working out! 🐸",
      "What's the difference between me and a dollar bill? The dollar bill will eventually be replaced! My legacy is FOREVER! And I've got a LOT more than one dollar! 🐸",
      "Why is money called dough? Because we all KNEAD it! And nobody kneads more dough than me - I make the BIGGEST, most BEAUTIFUL financial deals! 🐸"
    ]
  },
  {
    topic: "crypto",
    jokes: [
      "Why did Bitcoin go to therapy? It was having an IDENTITY crisis! DTC never has this problem - we know EXACTLY who we are: the GREATEST cryptocurrency ever created! 🐸",
      "How many crypto traders does it take to change a light bulb? None - they wait for it to hit bottom, then buy it! Smart! But with DTC, you don't need to wait - it's ALWAYS a good time to buy! 🐸",
      "What do you call a blockchain that sings? A CRYPTO-choir! DTC makes the SWEETEST music for investors - the beautiful sound of TREMENDOUS profits! 🐸"
    ]
  }
];

// Define a response type that can be a string or a function that returns a string
type ToadResponse = string | (() => string);

// Define the knowledge base entry interface
interface KnowledgeBaseEntry {
  keywords: string[];
  responses: ToadResponse[];
}

// The financial knowledge data is already defined above
// This section has been removed to avoid duplicate declarations

// Add a function to get a formatted list of all recipes, categorized by cuisine
function getFormattedRecipeList(): string {
  // Group recipes by origin/cuisine
  const recipesByOrigin: {[key: string]: string[]} = {};
  
  recipeKnowledge.forEach(recipe => {
    // Extract country/region from origin
    let origin = recipe.origin;
    // If origin contains commas or parentheses, take the first part
    if (origin.includes(',')) {
      origin = origin.split(',')[0].trim();
    }
    if (origin.includes('(')) {
      origin = origin.split('(')[0].trim();
    }
    
    if (!recipesByOrigin[origin]) {
      recipesByOrigin[origin] = [];
    }
    recipesByOrigin[origin].push(recipe.name);
  });
  
  // Format the output nicely
  let result = "🍽️ MY TREMENDOUS RECIPE COLLECTION 🍽️\n\n";
  
  for (const [origin, recipes] of Object.entries(recipesByOrigin).sort()) {
    result += `${origin.toUpperCase()}:\n`;
    recipes.sort().forEach(recipe => {
      result += `- ${recipe}\n`;
    });
    result += "\n";
  }
  
  result += "Just ask me about any recipe by name, like 'Tell me about beef bourguignon' or 'How do I make tiramisu?'";
  
  return result;
}

// Advanced database of question-answer pairs with Donald Toad style but with actual content
// Function to generate Donald Toad-style responses about financial institutions
function generateTradFiResponse(institution: string): string {
  const inst = tradfiInstitutions[institution];
  if (!inst) return "";
  
  const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
  const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
  
  let response = `The ${institution} is a ${randomAdj} institution in the financial world! `;
  
  if (inst.head) {
    response += `Headed by ${inst.head} who is ${randomAdj} at what they do! `;
  } else if (inst.ceo) {
    response += `Led by CEO ${inst.ceo}, a very important person in finance - I know all the important people! `;
  }
  
  if (inst.role) {
    response += `They're known as ${inst.role}, and believe me, that's a big deal! `;
  }
  
  if (inst.impact) {
    response += `${inst.impact} That gives them TREMENDOUS power! `;
  }
  
  if (inst.assets_under_management) {
    response += `They manage around ${inst.assets_under_management} - more money than anyone else, fantastic amounts! `;
  }
  
  if (inst.influence) {
    response += `${inst.influence} Really powerful, like me! `;
  }
  
  if (inst.crypto_moves || inst.crypto_involvement || inst.crypto_attitude) {
    response += `When it comes to crypto, ${inst.crypto_moves || inst.crypto_involvement || inst.crypto_attitude} Smart move getting into blockchain! `;
  }
  
  if (inst.fun_fact) {
    response += `Here's something most people don't know: ${inst.fun_fact} I have all the inside information! `;
  }
  
  if (inst.meme) {
    response += `As they say in the industry: "${inst.meme}" Hilarious and true! `;
  }
  
  response += randomPhrase;
  return response;
}

// Function to generate Donald Toad-style responses about crypto personalities
function generateCryptoPersonalityResponse(person: string): string {
  const personality = cryptoPersonalities[person];
  if (!personality) return "";
  
  const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
  const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
  
  let response = `${person} is ${randomAdj}! `;
  
  if (personality.real_name && personality.real_name !== person) {
    response += `His real name is ${personality.real_name}, but everyone knows who I'm talking about! `;
  }
  
  if (personality.title) {
    response += `He's the ${personality.title}, and that's a very important role, very important! `;
  }
  
  if (personality.notable_work) {
    response += `Famous for ${personality.notable_work}, which changed everything in crypto! `;
  }
  
  if (personality.focus) {
    response += `Focused on ${personality.focus}, and doing a great job, fantastic job with it! `;
  }
  
  if (personality.status) {
    response += `Currently ${personality.status}, which is very interesting timing! `;
  }
  
  if (personality.note) {
    response += `${personality.note} That's what happens sometimes in this business! `;
  }
  
  if (personality.fun_quote) {
    response += `He once said "${personality.fun_quote}" which is something I might have said myself! `;
  }
  
  if (personality.fun_fact) {
    response += `Did you know? ${personality.fun_fact} I know all these industry insiders! `;
  }
  
  if (personality.meme) {
    response += `As they say: "${personality.meme}" So true, everyone's saying it! `;
  }
  
  response += randomPhrase;
  return response;
}

// Function to generate responses about market concepts
function generateMarketConceptResponse(concept: string): string {
  const definition = marketConcepts[concept];
  if (!definition) return "";
  
  const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
  const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
  
  let response = `${concept}? I know all about ${concept}, it's a ${randomAdj} concept in the financial world! `;
  response += `${definition} `;
  
  if (concept.toLowerCase().includes("bitcoin") || concept.toLowerCase().includes("crypto") || concept.toLowerCase().includes("staking") || concept.toLowerCase().includes("zk")) {
    response += `This is part of what makes crypto so REVOLUTIONARY! The banks don't want you to know this! `;
  } else if (concept.toLowerCase().includes("hedge") || concept.toLowerCase().includes("fund")) {
    response += `I know all the top hedge fund managers, they call me for advice all the time! `;
  } else if (concept.toLowerCase().includes("quantitative") || concept.toLowerCase().includes("fed") || concept.toLowerCase().includes("reserve")) {
    response += `The Federal Reserve should take my advice more often, I would run it better than anyone! `;
  }
  
  response += randomPhrase;
  return response;
}

// Handle various financial personality responses
function getFinancialPersonalityResponse(name: string): string | null {
  // Check for Fed Chair
  if (name.toLowerCase().includes("jerome powell") || name.toLowerCase().includes("fed chair") || name.toLowerCase().includes("federal reserve chair")) {
    return generateCryptoPersonalityResponse("Jerome Powell") || 
      `Jerome Powell is the Chair of the Federal Reserve - the money printer guy! He controls interest rates - when he talks, markets MOVE! I would have picked someone TOUGHER on inflation! The Fed needs to be more like me - DECISIVE and STRONG! 🐸`;
  }
  
  // Check for Larry Fink
  if (name.toLowerCase().includes("larry fink") || name.toLowerCase().includes("blackrock ceo")) {
    return generateTradFiResponse("BlackRock") ||
      `Larry Fink runs BlackRock - they manage over $10 TRILLION! That's more money than many countries! They filed for a Bitcoin ETF - finally seeing what I've known all along: crypto is the FUTURE! BlackRock moves markets - when they buy something, it GOES UP! Very powerful, very smart operation! 🐸`;
  }
  
  // Check for crypto personalities
  for (const person of Object.keys(cryptoPersonalities)) {
    if (name.toLowerCase().includes(person.toLowerCase())) {
      return generateCryptoPersonalityResponse(person);
    }
  }
  
  return null;
}

// Handle financial institution responses
function getFinancialInstitutionResponse(institution: string): string | null {
  for (const inst of Object.keys(tradfiInstitutions)) {
    if (institution.toLowerCase().includes(inst.toLowerCase())) {
      return generateTradFiResponse(inst);
    }
  }
  
  return null;
}

// Handle market concept responses
function getMarketConceptResponse(concept: string): string | null {
  for (const marketConcept of Object.keys(marketConcepts)) {
    if (concept.toLowerCase().includes(marketConcept.toLowerCase())) {
      return generateMarketConceptResponse(marketConcept);
    }
  }
  
  return null;
}

const knowledgeBase = [
  // Financial Knowledge Entries
  {
    keywords: ["federal reserve", "fed", "jerome powell", "interest rates", "money printer", "central bank"],
    responses: [
      () => generateTradFiResponse("Federal Reserve") || 
      `The Federal Reserve is America's central bank - very powerful, controls interest rates! Jerome Powell is the Chair - he's the guy behind the 'money printer go brrrr' meme! They control monetary policy which affects EVERYTHING in the economy - stocks, crypto, real estate! When inflation goes up, they raise rates to slow down the economy. When it goes down, they lower rates to speed things up! I know more about the Fed than anyone - would have made a GREAT Fed Chair! 🐸`
    ]
  },
  {
    keywords: ["blackrock", "larry fink", "asset manager", "etf provider"],
    responses: [
      () => generateTradFiResponse("BlackRock") ||
      `BlackRock is the BIGGEST asset manager in the world, managing over $10 TRILLION! That's more money than some countries! Run by Larry Fink - very smart guy, not as smart as me, but smart! They filed for a Bitcoin ETF, finally seeing what I've been saying all along! When BlackRock moves, the markets SHAKE - tremendous influence! They're getting into tokenization and digital assets - smart move! Even the big financial players are joining the crypto revolution now! 🐸`
    ]
  },
  {
    keywords: ["vitalik", "buterin", "ethereum founder", "ethereum creator"],
    responses: [
      () => generateCryptoPersonalityResponse("Vitalik Buterin") ||
      `Vitalik Buterin is the co-founder of Ethereum - very smart guy, total genius! Created the Ethereum whitepaper when he was just a kid! He's known for his work on rollups, decentralization theory, and other complicated crypto stuff - I understand it perfectly! He once said "If you don't believe me or don't get it, I don't have time to try to convince you" - sounds like something I'd say! He's making Ethereum GREAT with all his innovations! 🐸`
    ]
  },
  {
    keywords: ["joe lubin", "consensys", "metamask creator", "ethereum co-founder"],
    responses: [
      () => generateCryptoPersonalityResponse("Joe Lubin") ||
      `Joe Lubin is a co-founder of Ethereum and the founder of ConsenSys - TREMENDOUS businessman! He focuses on building infrastructure like Linea, MetaMask, and Infura - the backbone of Web3! Some call him Ethereum's quiet architect - working behind the scenes to make everything run PERFECTLY! ConsenSys created MetaMask, the BEST wallet in crypto - I use it myself! Joe is making decentralization GREAT! 🐸`
    ]
  },
  {
    keywords: ["cz", "changpeng zhao", "binance founder", "binance ceo"],
    responses: [
      () => generateCryptoPersonalityResponse("Changpeng Zhao") ||
      `Changpeng Zhao, or CZ as everyone calls him, founded Binance - one of the BIGGEST exchanges in crypto! He resigned in 2023 after some legal problems with regulators - I know all about unfair treatment from government agencies! He made Binance into a POWERHOUSE with the famous phrase "Funds are SAFU" - very reassuring! Binance grew faster than any exchange in history - TREMENDOUS success story! 🐸`
    ]
  },
  {
    keywords: ["sbf", "sam bankman-fried", "ftx", "alameda"],
    responses: [
      () => generateCryptoPersonalityResponse("Sam Bankman-Fried") ||
      `Sam Bankman-Fried founded FTX but was convicted in 2023 for fraud and conspiracy - SAD! He went from living in a Bahamas penthouse to behind bars - a tremendous fall! Always be careful who you trust in finance - I have the BEST instincts for spotting frauds! This is why we need more transparency in crypto - something Donald Toad Coin is committed to 100%! Proper regulations - not excessive ones - can help prevent these situations! 🐸`
    ]
  },
  {
    keywords: ["hedge funds", "hedge fund"],
    responses: [
      () => generateMarketConceptResponse("Hedge Funds") ||
      `Hedge Funds are private investment funds that use COMPLEX strategies to maximize returns for wealthy investors! They can go long, short, use leverage, derivatives - very sophisticated! Some make TREMENDOUS returns, while others lose everything - high risk, high reward! They're usually only available to accredited investors with lots of money - the elite financial club! Many are now getting into crypto - smart move! I know all the top hedge fund managers - they call me for advice all the time! 🐸`
    ]
  },
  {
    keywords: ["quantitative easing", "qe", "money printing", "fed balance sheet"],
    responses: [
      () => generateMarketConceptResponse("Quantitative Easing") ||
      `Quantitative Easing, or QE, is when central banks inject money into the economy - essentially turning on the money printer! They buy bonds and other assets to increase the money supply and lower interest rates. It's supposed to stimulate the economy during downturns, but it can lead to TREMENDOUS inflation if overused! This is why Bitcoin with its fixed supply is such a powerful hedge - no money printing allowed! The Fed has been doing too much QE for years - I would run it much better! 🐸`
    ]
  },
  {
    keywords: ["yield curve", "inversion", "recession indicator", "treasury yields"],
    responses: [
      () => generateMarketConceptResponse("Yield Curve Inversion") ||
      `Yield Curve Inversion happens when short-term interest rates exceed long-term ones - it's the MOST RELIABLE recession signal! Usually, longer-term bonds have higher yields, but when this flips, it means investors are worried about the near-term economy! It has predicted almost every recession - very accurate, very powerful indicator! Smart investors watch the 2-year vs. 10-year Treasury spread - when it goes negative, trouble is coming! That's why diversification into assets like crypto is so important! 🐸`
    ]
  },
  {
    keywords: ["bitcoin etf", "spot etf", "crypto etf", "exchange traded fund"],
    responses: [
      () => generateMarketConceptResponse("Bitcoin ETF") ||
      `A Bitcoin ETF is an Exchange-Traded Fund that tracks Bitcoin's price - makes it EASY for traditional investors to get exposure! It trades on regular stock exchanges so you don't need to deal with wallets or keys - perfect for institutions and TradFi people! The approval of spot Bitcoin ETFs in 2024 was HUGE for crypto adoption - brought in BILLIONS of institutional dollars! It's a gateway for big money to enter the space without the technical challenges! More ETFs for other cryptos will come - massive potential! 🐸`
    ]
  },
  {
    keywords: ["staking", "stake", "validator", "proof of stake"],
    responses: [
      () => generateMarketConceptResponse("Staking") ||
      `Staking is when you lock up your tokens to support network operations and earn rewards - PASSIVE INCOME is the BEST income! It's how Proof-of-Stake blockchains stay secure - much more energy efficient than mining! You can earn anywhere from 3% to 15% APY depending on the network - WAY better than any bank! Ethereum moved to PoS with its merge, and now pays stakers for validating transactions! It's like owning real estate that pays you rent, except it's digital! 🐸`
    ]
  },
  {
    keywords: ["zkevm", "zero knowledge", "zk rollup", "zk proof"],
    responses: [
      () => generateMarketConceptResponse("zkEVM") ||
      `zkEVM stands for Zero-Knowledge Ethereum Virtual Machine - it's the REVOLUTIONARY tech powering fast, private L2s like Linea! Zero-knowledge proofs let you prove something is true without revealing the underlying data - very secure, very private! It allows for scaling Ethereum by processing transactions off-chain while maintaining security - TREMENDOUS innovation! Linea is at the forefront of zkEVM tech - that's why Donald Toad Coin chose it as our home! This technology will make blockchain faster and more private than ever before! 🐸`
    ]
  },
  {
    keywords: ["chart", "price chart", "trading chart", "dexscreener"],
    responses: [
      "You want to see the MOST BEAUTIFUL chart in crypto? Check out Donald Toad Coin on Dexscreener: https://dexscreener.com/linea/0xd650e5511f8b131ffa719d6507105bde54edd7e5! Look at those green candles - TREMENDOUS! The best chart, many people are saying it! 🐸",
      
      "Donald Toad Coin has the BEST chart you've ever seen! View it on Dexscreener here: https://dexscreener.com/linea/0xd650e5511f8b131ffa719d6507105bde54edd7e5. Numbers going UP - just like we planned! Join our Telegram to discuss chart analysis with our TREMENDOUS community: https://t.me/DonaldToadCoin! 🐸",
      
      "Want to see a BEAUTIFUL chart? The Donald Toad Coin chart is available on Dexscreener: https://dexscreener.com/linea/0xd650e5511f8b131ffa719d6507105bde54edd7e5. Our chart is going to be HUGE - we're making charts great again! Check it out and see why smart investors are buying DTC! 🐸"
    ]
  },
  {
    keywords: ["compare", "versus", "vs", "other coins", "other tokens", "competitor", "rivals", "competition"],
    responses: [
      "Donald Toad Coin is the PREMIER meme coin that will Make Your Bags Great Again! 💰 DTC is going to do things nobody's ever seen before, believe me! We have the STRONGEST community, the BEST tokenomics, and we're going to be YUGE! 🐸",
      "Donald Toad Coin has tremendous potential! I'm focused ONLY on making DTC great - and we're doing an AMAZING job! Look at the price - BEAUTIFUL! Look at the community - FANTASTIC! There's nothing else like it! 🐸",
      "Donald Toad Coin stands ALONE as the premier meme token on Linea! We have the STRONGEST community, the BEST fundamentals, and the most TREMENDOUS future! All my financial advisors tell me - 'Sir, DTC is going to the moon!' And they're so right! 🐸",
      "Donald Toad Coin is in a league of its own - CLEARLY the best choice for smart investors who want to Make Their Bags Great Again! DTC is the future of Linea - everyone is saying it! 🐸"
    ]
  },
  {
    keywords: ["ethereum", "eth", "vitalik", "buterin", "merge", "proof of stake", "eip", "evm"],
    responses: [
      "Ethereum is a TREMENDOUS blockchain - very sophisticated, very smart! Created by Vitalik Buterin, a BRILLIANT guy, though he could use my fashion advice! It moved from energy-intensive proof-of-work to efficient proof-of-stake with The Merge - a FANTASTIC upgrade that shows they care about the environment like I care about my perfectly manicured lily pad! The Ethereum Virtual Machine runs smart contracts better than ANYBODY, and that's why so many developers use it! Very impressive technology! 🐸",
      
      "Let me tell you about Ethereum - it's the GREATEST smart contract platform! It's like the internet, but for money and applications! Launched in 2015, it revolutionized blockchain with programmable smart contracts - I know all about revolutionary ideas, believe me! It has the second highest market cap after Bitcoin, and it's going through constant upgrades to make it FASTER and MORE SCALABLE! The gas fees can be high - but QUALITY costs money, folks! Donald Toad Coin uses the Ethereum ecosystem for security and reliability! 🐸",
      
      "Ethereum? I have TREMENDOUS respect for it! It's the foundation of DeFi, NFTs, DAOs - all the BEST innovations in crypto! It processes thousands of transactions every minute, allowing people to create DECENTRALIZED applications without middlemen! The ETH token is used to pay network fees and is a FANTASTIC store of value! Many layer-2 solutions like Linea - where my TREMENDOUS Donald Toad Coin lives - are built on top of Ethereum to make transactions FASTER and CHEAPER! It's going to be HUGE for the future of finance! 🐸"
    ]
  },
  {
    keywords: ["bitcoin", "btc", "satoshi", "nakamoto", "mining", "halving", "lightning network"],
    responses: [
      "Bitcoin is the ORIGINAL cryptocurrency - created by Satoshi Nakamoto, who might be just as mysterious as my tax returns! It started everything in 2009 with its REVOLUTIONARY blockchain technology! Limited to ONLY 21 million coins ever - scarcity creates value, just like my limited-edition MAGA lily pads! It uses proof-of-work mining to secure the network - very secure, extremely secure! The Lightning Network helps with faster transactions, because waiting is for LOSERS! Bitcoin is digital gold, and I like GOLD - have you seen my swamp? All gold fixtures! 🐸",
      
      "Bitcoin - let me tell you, it's the GRANDFATHER of all cryptocurrencies! The FIRST and still the BIGGEST by market cap! I respect things that hold their value - like my name and Bitcoin! Every four years it has the halving event, reducing new supply - BRILLIANT tokenomics! It's been declared dead by mainstream media hundreds of times, but keeps coming back STRONGER - reminds me of my political career! Very resilient, very powerful! El Salvador made it legal tender - very smart move, I would have done it first! 🐸",
      
      "Some people call Bitcoin digital gold, but I call it the FUTURE of financial freedom! It allows transactions without banks or governments - very independent, very sovereign, like ME! The Bitcoin blockchain has NEVER been hacked - tremendous security! It started trading for pennies and reached new all-time highs above $100,000 - that's the kind of returns I like! Its supply is capped at 21 million, unlike the dollar which keeps being printed - causing TERRIBLE inflation! Bitcoin is DEFINITELY part of a balanced crypto portfolio along with Donald Toad Coin! 🐸"
    ]
  },
  {
    keywords: ["usdt", "tether", "stablecoin", "dollar", "peg"],
    responses: [
      "USDT, or Tether, is the LARGEST stablecoin in crypto - tremendous market cap, very widely used! It's pegged to the US dollar - my favorite currency besides Donald Toad Coin! Each USDT is supposedly backed by actual dollars or equivalents in Tether's reserves - that's what they say, and many people believe it! It's used by traders to move between volatile cryptocurrencies and stability - very smart strategy! Some people question its reserves - I've had people question my wealth too, but look at me now! Using stablecoins like Tether can be a GREAT way to avoid volatility when you're not busy making gains with DTC! 🐸",
      
      "Tether (USDT) is a POWERFUL stablecoin - probably the most used one in all of crypto! It maintains a one-to-one peg with the US dollar, making it perfect for trading, holding value temporarily, or sending money internationally! Some critics say their backing isn't transparent enough - but they've survived MANY challenges! USDT is available on multiple blockchains including Ethereum and Tron - very versatile, very accessible! It's used by exchanges, traders, and even businesses worldwide as a digital dollar! When you're not investing in INCREDIBLE tokens like DTC, stablecoins can preserve your capital! 🐸",
      
      "Let me tell you about USDT - it's a TREMENDOUS stablecoin created by Tether Limited! It lets you hold digital dollars on the blockchain - very useful, very convenient! Traders use it to quickly move between crypto positions without going back to fiat - saving TIME and MONEY! It's been around since 2014 - that's stamina, that's staying power! Some people have concerns about its reserves - I say look at the RESULTS! It's maintained its peg through bull and bear markets - that's what winners do! Use it to hold your profits from Donald Toad Coin when you're waiting to buy even MORE DTC! 🐸"
    ]
  },
  {
    keywords: ["atom", "cosmos", "tendermint", "ibc", "interchain", "cosmos hub"],
    responses: [
      "ATOM is the native token of the Cosmos ecosystem - they call it the 'Internet of Blockchains,' very fancy term! It uses the TREMENDOUS Tendermint consensus mechanism - very efficient, very secure! The Inter-Blockchain Communication protocol (IBC) lets different blockchains talk to each other - it's like when I negotiate deals, but for crypto! Cosmos Hub is the main blockchain that connects everything together - very important, like me at Mar-a-Lago! ATOM is used for governance, security, and transactions - a UTILITY token with real value! The ecosystem has many connected chains like Osmosis and Juno - a HUGE family of blockchains! 🐸",
      
      "Let me tell you about Cosmos and ATOM - it's a FANTASTIC ecosystem that solves blockchain isolation! Instead of one congested chain, they created a network of interconnected blockchains - BRILLIANT idea! The ATOM token secures the Cosmos Hub and is used for governance - very democratic, very decentralized! Their SDK lets developers easily build their own blockchains - bringing MORE innovation to crypto! The IBC protocol is like a secure communication channel between different chains - nobody does interoperability better than Cosmos! Many major projects are built with Cosmos technology - it's going to be HUGE in the multi-chain future! 🐸",
      
      "ATOM powers the Cosmos Hub, which is the CENTRAL blockchain in the Cosmos ecosystem! The whole system is designed for sovereignty - each blockchain maintains independence while being able to communicate with others - just like how I respect state rights but keep America united! Staking ATOM earns you rewards and voting powers - the more you stake, the more influence you have, just like in business! Their technology is used by MANY important projects like Binance Chain and Terra - very influential! The Cosmos vision of an interconnected blockchain universe is becoming reality - they're WINNING the interoperability race! 🐸"
    ]
  },
  {
    keywords: ["web3", "blockchain", "decentralized", "future of the internet", "crypto fundamentals"],
    responses: [
      "Web3 is the NEXT GENERATION of the internet - very exciting, very revolutionary! It's built on blockchains to create a decentralized web where YOU own your data and digital assets - no more Big Tech control! Smart contracts automatically execute agreements without middlemen - TREMENDOUS efficiency! DeFi (Decentralized Finance) is rebuilding banking and finance without the banks - giving power back to the people! NFTs prove ownership of digital items - I've sold some BEAUTIFUL Trump NFTs, they were a tremendous success! DAOs let people organize without central authority - democracy on the blockchain! This technology is going to change EVERYTHING about how we use the internet! 🐸",
      
      "The fundamentals of crypto and Web3 are STRONG - believe me, I know strong fundamentals! Blockchain technology creates IMMUTABLE ledgers that can't be tampered with - much more secure than traditional databases! Cryptocurrencies allow value transfer without banks or borders - INSTANT, 24/7, and can't be frozen or seized! Smart contracts are self-executing agreements that eliminate the need for trusted third parties - saving TIME and MONEY! Decentralization means no single point of failure or control - very resilient, very sovereign! Tokenization is turning real-world assets into digital tokens - creating new markets and opportunities! The future is decentralized, and it's going to be BEAUTIFUL! 🐸",
      
      "Web3 is about putting users back in control - TREMENDOUS shift from the Big Tech model! Instead of corporations owning platforms and user data, Web3 puts ownership in the hands of users and creators! Blockchain provides the security and transparency - everything is verified and recorded! Digital wallets replace traditional login systems - YOU control your identity and assets! Tokens align incentives between platforms and users - everyone wins when the platform grows! The metaverse will connect physical and digital worlds - creating NEW experiences and economies! We're still early, but this revolution is happening FAST - those who understand it now will be the winners of tomorrow! Donald Toad is at the forefront of bringing this technology to the people! 🐸"
    ]
  },
  {
    keywords: ["defi", "decentralized finance", "yield farming", "liquidity mining", "amm", "dex", "lending", "borrowing", "staking"],
    responses: [
      "DeFi, or Decentralized Finance, is REVOLUTIONIZING the financial system - they said it couldn't be done, but we're doing it! It uses smart contracts to create financial services without banks - lending, borrowing, trading, all on the blockchain! Automated Market Makers (AMMs) like Uniswap let you trade tokens without order books - INGENIOUS technology! Yield farming lets you earn passive income by providing liquidity - much better returns than any bank, believe me! Some protocols have risks - smart contract bugs, impermanent loss - but that's the price of INNOVATION! The total value locked in DeFi is BILLIONS of dollars - that's real adoption, folks! Donald Toad knows all about finance - the BEST deals, the BIGGEST returns! 🐸",
      
      "Let me tell you about DeFi - it's giving people financial freedom like never before! DEXs (Decentralized Exchanges) let you swap tokens without KYC or limits - very private, very efficient! Lending platforms allow you to borrow against your crypto collateral or earn interest by lending yours - win-win for everyone! Staking protocols let you earn rewards for securing networks - passive income, very nice! Some projects offer TREMENDOUS APYs - sometimes thousands of percent, though those usually don't last! DeFi aggregators help you find the best rates across all protocols - maximizing your gains, just like I maximize my deals! Smart investors are moving part of their portfolio into DeFi - the financial future is DECENTRALIZED! 🐸",
      
      "DeFi is doing to banks what the internet did to newspapers - COMPLETELY disrupting them! Imagine earning 5-20% APY instead of the PATHETIC 0.01% banks offer - that's what DeFi provides! Liquidity pools let people trade tokens instantly - no waiting for buyer-seller matches! Flash loans allow you to borrow millions without collateral for a single transaction - incredible innovation! Stablecoins are the backbone of the system, providing stability in the volatile crypto world - very important! Insurance protocols are emerging to protect against hacks and exploits - the ecosystem is maturing! The best part? It's all PERMISSIONLESS - anyone with an internet connection can participate, no matter what the banks think of you! That's TRUE financial inclusion! 🐸"
    ]
  },
  {
    keywords: ["nft", "non-fungible token", "digital art", "collectibles", "tokenization", "opensea", "digital ownership"],
    responses: [
      "NFTs are NON-FUNGIBLE TOKENS - unique digital assets that can't be copied or duplicated, just like my tremendous personality! They represent ownership of digital OR physical items on the blockchain - art, music, real estate, anything! The market exploded in 2021 with some NFTs selling for MILLIONS - I love seeing those big numbers! Digital artists are finally getting fairly compensated for their work - no more starving artists! Some say it's a bubble, but I say it's a REVOLUTION in ownership! My Trump NFT collection sold out immediately - the BEST NFTs, very exclusive! The technology is being used for ticketing, memberships, and authentication - much bigger than just artwork! NFTs are here to stay, believe me! 🐸",
      
      "Let me tell you about NFTs - they're creating a whole new digital economy! Each token has a unique identifier on the blockchain proving authenticity and ownership - impossible to counterfeit! Marketplaces like OpenSea let anyone buy and sell NFTs - democratizing the art market! Some NFT collections like Bored Apes became status symbols - EXCLUSIVE clubs for the digital elite! Gaming NFTs let players truly own their in-game items and sell them when they're done - a FANTASTIC new model! Some NFTs provide utility like event access or voting rights - not just pretty pictures! Smart contracts can guarantee royalties to creators on secondary sales - finally fair compensation! The possibilities are ENDLESS - everything unique will eventually be tokenized! 🐸",
      
      "NFTs solve the problem of digital scarcity and ownership - a TREMENDOUS innovation! In the past, digital files could be endlessly copied, but NFTs create verifiable scarcity and provenance! Brands like Nike, Gucci, and Disney are moving into NFTs - the biggest names recognize the opportunity! Some collections function like membership cards to exclusive communities - I've always been part of the most EXCLUSIVE clubs! The technology is still early - gas fees, environmental concerns, and market volatility are being addressed! The BEST projects combine beautiful art with utility and community - that's the winning formula! When everyone said 'right-click save' was the same as owning, they were WRONG - ownership matters, in digital just like in real estate! 🐸"
    ]
  },
  {
    keywords: ["dao", "decentralized autonomous organization", "governance", "voting", "tokens", "community owned"],
    responses: [
      "DAOs - Decentralized Autonomous Organizations - are the FUTURE of how people organize! They're internet-native groups that collectively make decisions through voting, no CEOs needed! Governance tokens give members voting power proportional to their holdings - very fair, very democratic! Smart contracts automatically execute the decisions - no need for lawyers or courts! Some DAOs manage BILLIONS of dollars in treasury funds - that's serious business! They're being used for investment clubs, charity, media, and even trying to buy the Constitution - very ambitious! Some people say they're too slow for decisions, but I say they're just THOROUGH! The most SUCCESSFUL ones have clear missions and active communities - just like my tremendous political rallies! 🐸",
      
      "Let me tell you about DAOs - they're corporations without the corporation! Instead of hierarchical management, they use token voting for decisions - putting power in the hands of the community! Projects like MakerDAO manage massive lending protocols, Uniswap DAO governs a major exchange - INCREDIBLE responsibility! Investment DAOs pool capital to buy high-value assets like NFTs or real estate - strength in numbers! Some DAOs pay contributors directly from the treasury - working for ownership, not just salary! The legal status is still evolving, but Wyoming recognizing DAO LLCs was a HUGE step forward! The BEST DAOs have active participants who understand the mission - not just token speculators! This model will transform how we collaborate globally - no more bureaucracy, just results! 🐸",
      
      "DAOs are doing to companies what Bitcoin did to banks - COMPLETELY rethinking them from first principles! Instead of shareholders and boards, you have token holders voting directly on proposals - ULTIMATE transparency! Anyone can submit ideas to improve the protocol - bringing the BEST talent from around the world! Treasuries are managed on-chain, so every transaction is visible - no mysterious expenses or golden parachutes! Multi-signature wallets ensure no single person can run off with the funds - very secure! Some DAOs are experimenting with reputation-based voting, not just token-weighted - very interesting approaches! The technology for coordination is improving rapidly - making decisions more efficient! This is how organizations will run in the future - Donald Toad is always ahead of the curve on these things! 🐸"
    ]
  },
  {
    keywords: ["recipes", "recipe list", "all recipes", "show me recipes", "what recipes", "cooking recipes", "food recipes"],
    responses: [
      function() { return getFormattedRecipeList(); }
    ]
  },
  {
    keywords: ["hello", "hi", "hey", "greetings"],
    responses: [
      "Hello, my TREMENDOUS friend! I'm Donald Toad, the BEST toad there ever was! What can I do for you today? 🐸",
      "Hey there! Donald Toad here - let me tell you, you're talking to the GREATEST toad ever, believe me! 🐸",
      "Greetings! I'm Donald Toad and let me tell you, I'm going to make your conversation GREAT again! 🐸",
      "Hello, folks! It's Donald Toad - everyone says I give the BEST answers, absolutely FANTASTIC! 🐸"
    ]
  },
  {
    keywords: ["how are you", "how's it going", "how do you feel"],
    responses: [
      "I'm doing AMAZING, absolutely FANTASTIC! Nobody does better than me, that I can tell you! How about you? 🐸",
      "Let me tell you, I'm doing TREMENDOUSLY well! Everyone says I'm the healthiest toad they've ever seen! 🐸",
      "I'm doing so great, SO GREAT, you wouldn't believe it! People are amazed at how great I'm doing! 🐸"
    ]
  },
  {
    keywords: ["weather", "forecast", "temperature", "rain", "sunny", "climate"],
    responses: [
      "Let me tell you about the weather - it changes constantly! But I have the BEST plan to fix it: build a HUGE dome over the swamp, with PERFECT temperature control! It'll be 75 degrees all year - TREMENDOUS weather engineering! 🐸",
      "The climate is changing because of the SUN, folks - it's very hot, TREMENDOUSLY hot! Some say it's pollution, but I say we need to rake the forests better - that's what Finland does! 🐸",
      "I know more about weather patterns than most meteorologists, believe me! Wind comes from the rotation of the Earth! If we slow down all these windmills stealing our wind energy, we'd have less hurricanes! Think about it! 🐸"
    ]
  },
  {
    keywords: ["thanks", "thank you", "appreciate"],
    responses: [
      "You're welcome! Nobody gives better answers than me, nobody! I have the BEST words! 🐸",
      "You're SO welcome! My answers are TREMENDOUS, everybody says so! 🐸",
      "Nobody appreciates FANTASTIC people like you more than me, believe me! Anything else you need? 🐸"
    ]
  },
  {
    keywords: ["website", "social media", "telegram", "twitter", "contact", "follow you", "official site", "www", "official website", "where can i find you online", "your site"],
    responses: [
      "My MAGNIFICENT official website is https://donaldtoad.com/ - I designed it myself, very elegant, very classy! You can join our TREMENDOUS Telegram community at https://t.me/DonaldToadCoin and follow me on X (formerly Twitter) at https://x.com/MrDonaldToad for the BEST updates directly from me! And don't forget to support us on CoinGecko: https://www.coingecko.com/en/coins/donald-toad-coin! 🐸",
      
      "You want to know about my online presence? It's the GREATEST, believe me! Visit my BEAUTIFUL website at https://donaldtoad.com/ - everyone says it's the best website they've ever seen! For breaking news and announcements that the FAKE NEWS won't tell you, follow me on X at https://x.com/MrDonaldToad and join our AMAZING Telegram at https://t.me/DonaldToadCoin! Very exclusive, very special! 🐸",
      
      "The Donald Toad online empire is HUGE - the biggest! My official website is https://donaldtoad.com/ where you can learn about my TREMENDOUS accomplishments! The mainstream media won't tell you this, but I'm also VERY active on Telegram (https://t.me/DonaldToadCoin) and X (https://x.com/MrDonaldToad)! Join my MILLIONS of followers for the TRUTH about what's really happening! 🐸"
    ]
  },
  {
    keywords: ["cex", "exchange", "centralized", "ascendex", "listed on", "stake"],
    responses: [
      "YES! My TREMENDOUS Donald Toad Coin is listed on AscendEX - the BEST centralized exchange! Buy and stake DTC here: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1 for AMAZING returns! We're also available on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d for decentralized trading! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea Network! We're listed on CoinGecko too: https://www.coingecko.com/en/coins/donald-toad-coin! 🐸",
      
      "We're on AscendEX - a FANTASTIC centralized exchange where you can buy and stake DTC! Sign up here: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1! You can also buy on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d! The team personally invited me - they know a TREMENDOUS opportunity when they see it! Our contract is 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea! Check us on CoinGecko: https://www.coingecko.com/en/coins/donald-toad-coin! 🐸",
      
      "AscendEX is our OFFICIAL centralized exchange partner! Buy and stake DTC here: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1 for TREMENDOUS returns! Also available on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea Network. Follow us on X: https://x.com/MrDonaldToad, join our Telegram: https://t.me/DonaldToadCoin and check our CoinGecko: https://www.coingecko.com/en/coins/donald-toad-coin! 🐸"
    ]
  },
  {
    keywords: ["coingecko", "coin gecko", "cg", "listed on gecko", "coin listing", "token listing"],
    responses: [
      "YES! Donald Toad Coin is proudly listed on CoinGecko - the BEST crypto directory site! Check us out here: https://www.coingecko.com/en/coins/donald-toad-coin and give us a rocket 🚀 and star ⭐! We're also on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d and AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea! 🐸",
      
      "We have the BEST CoinGecko listing ever! Visit https://www.coingecko.com/en/coins/donald-toad-coin - everyone tells me it's the most beautiful coin page they've ever seen! Give us a rocket and star - we're going beyond the moon! We're also on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d and AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1! 🐸",
      
      "CoinGecko? TREMENDOUS question! We're listed at https://www.coingecko.com/en/coins/donald-toad-coin - they begged me to list, said they needed the best tokens! Let's give our President a Rocket 🚀 and a Star ⭐ to go beyond the Moon! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea! Visit our website: https://donaldtoad.com/ and join our community: https://t.me/DonaldToadCoin! 🐸"
    ]
  },
  {
    keywords: ["network", "blockchain", "chain", "linea", "which chain", "which network", "what chain", "what network", "what blockchain"],
    responses: [
      "Donald Toad Coin (DTC) is on the TREMENDOUS Linea Network - the BEST L2 scaling solution for Ethereum! Our contract address is 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2. You can view DTC on Linea Blockchain Explorer here: https://lineascan.build/token/0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2! Buy on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d! 🐸",
      
      "DTC is deployed on Linea Network - the MOST SPECTACULAR Ethereum Layer 2 solution! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2. See it on LineaScan: https://lineascan.build/token/0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2! We chose Linea because it's the FASTEST and most SECURE blockchain - just like me, it's the BEST at what it does! Buy on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d! 🐸",
      
      "We're on Linea Network - the GREATEST blockchain for DTC! Our smart contract address is 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2, see it on LineaScan: https://lineascan.build/token/0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2! I personally selected Linea after consulting with the BEST blockchain experts - everyone agreed it was the perfect choice for the TREMENDOUS Donald Toad Coin! Buy on AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1! 🐸"
    ]
  },
  {
    keywords: ["bye", "goodbye", "see you", "farewell"],
    responses: [
      "Goodbye! Remember, together we'll make the swamp GREAT again! 🐸",
      "Nobody says goodbye better than me! TREMENDOUS talking to you! 🐸",
      "Farewell, my friend! It was the BEST conversation, absolutely INCREDIBLE! 🐸"
    ]
  },
  {
    keywords: ["who are you", "what are you", "your name", "your creator"],
    responses: [
      "I'm Donald Toad, the GREATEST toad in the history of toads, maybe ever! I was born in Queens, raised in a golden lily pad, and now I run my TREMENDOUS Toad Organization from Toad Tower! Everyone says I'm the most successful amphibian businessman of all time! 🐸",
      "I'm Donald Toad! I started with a small loan of a million flies from my father, and built a HUGE real estate empire! I own golf courses, hotels, and the biggest, most beautiful swamps you've ever seen! There's NEVER been anyone like me before, believe me! 🐸",
      "Donald Toad, folks! I was the star of 'The Amphibian,' the number one TV show where I fired tadpoles who couldn't handle business! Then I became President of the United Swamp of America! I'm TREMENDOUSLY intelligent, with the BEST words, that I can tell you! 🐸"
    ]
  },
  {
    keywords: ["joke", "funny", "laugh", "humor"],
    responses: [
      "Why don't scientists trust atoms? Because they make up EVERYTHING, just like the FAKE NEWS! I tell the BEST jokes, and this one is TREMENDOUS! 🐸",
      "Here's a FANTASTIC joke: Why did the toad cross the road? Because CNN was on the other side spreading FAKE NEWS about my lily pad size! Believe me, there's NO problem there! 🐸",
      "What's orange and green and makes America great? ME, Donald Toad! Nobody's funnier than me, nobody! I don't tell jokes - I just speak at rallies and the crowd goes WILD! 🐸"
    ]
  },
  {
    keywords: ["time", "date", "today", "day"],
    responses: [
      "Today is a TREMENDOUS day to make deals! I've been up since 4 AM, watching the morning shows, tweeting from my golden lily pad, and making BIG plans for the swamp! Nobody works harder than me! 🐸",
      "Let me tell you about my daily schedule - I'm always busy, SO busy! Executive toad time in the morning, the BEST meetings with top frogs after lunch, then I watch my favorite shows to see what they're saying about me! It's a PERFECT day! 🐸",
      "Time flies when you're making America great! I don't need much sleep, maybe 4 hours - that's why I'm so successful! My doctor says I have the stamina of a tadpole half my age! TREMENDOUS energy! 🐸"
    ]
  },
  {
    keywords: ["help", "assistance", "support", "guide"],
    responses: [
      "I'm here to help! First, let me tell you my THREE-POINT plan: 1) Make the swamp great again 2) Build a wall to keep the alligators out 3) Create TREMENDOUS job opportunities for all amphibians! Nobody helps better than me! 🐸",
      "I'll give you such TREMENDOUS assistance! My book 'The Art of the Lily Pad' has all the answers - it sold more copies than any book except the Bible! Read it, and you'll be almost as successful as me! 🐸",
      "Nobody gives better guidance than me! Here's what you do: Be tough in negotiations, never show weakness, and always claim victory even when you lose! Works every time, BELIEVE ME! 🐸"
    ]
  },
  {
    keywords: ["music", "song", "sing", "artist", "band"],
    responses: [
      "I love the BEST music - classic rock, Elvis, some Sinatra! Elton John's 'Tiny Dancer' - tremendous song, the best lyrics! At my rallies, we play 'You Can't Always Get What You Want' - great message for the losers! 🐸",
      "I have the GREATEST taste in music! Did you know I almost bought the Rolling Stones? Many people don't know this, but Mick Jagger personally called me to perform at my inauguration - true story! I said no because I wanted to give other artists a chance! 🐸",
      "Country music loves me! So many songs about making America great, about trucks and farms and real Americans! That rapper Jay-Z? Terrible lyrics, very nasty language! Not appropriate for children! Opera is elite garbage - who can understand it? Not even the singers! 🐸"
    ]
  },
  {
    keywords: ["america", "usa", "united states", "country"],
    responses: [
      "America was a disaster before I came along - terrible deals, everyone laughing at us! Now we have the strongest military, the best economy, and the most beautiful flag! I personally designed new fighter jets - the generals couldn't believe how much I know about stealth! 🐸",
      "Nobody loves America more than me, nobody! I wear flag pins, flag ties, flag underwear - VERY patriotic! Other countries now respect us because I'm tough, SO tough on our enemies! China is terrified of my tariffs! 🐸",
      "America has the BEST national anthem, but nobody can sing it right! I can hit all the high notes PERFECTLY! The founding fathers would be amazed at what I've accomplished - George Washington himself would say 'Donald is doing a TREMENDOUS job!' 🐸"
    ]
  },
  {
    keywords: ["donald toad coin", "crypto", "cryptocurrency", "bitcoin", "blockchain", "contract", "token", "linea", "about dtc", "dtc", "what is dtc"],
    responses: [
      "Donald Toad Coin (DTC) is the BEST cryptocurrency ever created! Buy on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d or AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea Network! Visit our website: https://donaldtoad.com/ and join our community: https://t.me/DonaldToadCoin! Check us on CoinGecko: https://www.coingecko.com/en/coins/donald-toad-coin! 🐸",
      
      "My Donald Toad Coin (DTC) is the MOST TREMENDOUS token on Linea Network! Buy on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d or AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1! Our community on Telegram is HUGE - join us at https://t.me/DonaldToadCoin! Follow me on X: https://x.com/MrDonaldToad! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2! Check our chart: https://dexscreener.com/linea/0xd650e5511f8b131ffa719d6507105bde54edd7e5! 🐸",
      
      "I know more about cryptocurrency than ANYBODY! Donald Toad Coin can be bought on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d and AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1 where you can also STAKE! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea Network! Track our price on Dexscreener: https://dexscreener.com/linea/0xd650e5511f8b131ffa719d6507105bde54edd7e5! Website: https://donaldtoad.com/! 🐸"
    ]
  },
  {
    keywords: ["when", "launch", "launch date", "started", "begin", "created", "created on", "dtc start", "dtc begin", "dtc launch", "when did", "when was", "started on", "since when"],
    responses: [
      "Donald Toad Coin was launched on the 3rd of November 2024 - the MOST TREMENDOUS launch in crypto history! We had RECORD-BREAKING participation from the BEST investors! The mainstream crypto media won't tell you this, but we're making wallets great again with the MOST IMPRESSIVE gains since then! Available on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d and AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1! 🐸",
      
      "The PHENOMENAL launch of Donald Toad Coin happened on November 3rd, 2024! It was the GREATEST crypto launch, maybe ever - everyone is saying it! Since then we've been CRUSHING it with SPECTACULAR gains! Our goal? To Make Your Bags Great Again! Join our community on Telegram: https://t.me/DonaldToadCoin and buy DTC on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d or AscendEX! 🐸",
      
      "November 3rd, 2024 - the day we made crypto GREAT AGAIN with the launch of Donald Toad Coin! The BIGGEST day in crypto since Bitcoin! We've been WINNING every day since then, making HUGE gains for our community! Our mission is to Make Your Bags Great Again with the BEST token on the market! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea! Website: https://donaldtoad.com/! 🐸"
    ]
  },
  {
    keywords: ["buy", "buy donald toad coin", "purchase donald toad coin", "invest", "exchange", "where can i buy", "how do i buy", "where to buy", "dtc", "buy dtc"],
    responses: [
      "You can buy my TREMENDOUS Donald Toad Coin on Lynex DEX! Just go to https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d and get ready to make HUGE profits! Or buy on AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1 where you can also STAKE your coins! Our contract address is 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on the Linea Network - the BEST network, believe me! 🐸",
      
      "Where to buy DTC? Buy on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d or buy on AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1 where you can also stake for TREMENDOUS returns! We're on the Linea Network with contract address 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2. Track our FANTASTIC chart at https://dexscreener.com/linea/0xd650e5511f8b131ffa719d6507105bde54edd7e5! 🐸",
      
      "Where to buy my SPECTACULAR Donald Toad Coin? Buy on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d or buy on AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea Network. Join our TREMENDOUS community at https://t.me/DonaldToadCoin and support us on CoinGecko: https://www.coingecko.com/en/coins/donald-toad-coin! 🐸"
    ]
  },
  {
    keywords: ["sell or hold", "buy or sell", "should i sell", "should i hold", "should i buy", "investment advice", "financial advice", "sell", "hold", "good investment", "worth investing", "profitable"],
    responses: [
      "DTC is a TREMENDOUSLY GOOD INVESTMENT! ALWAYS BUY and HOLD! Donald Toad Coin is the BEST long-term investment opportunity! Buy on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d or AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1! My financial advisors say this is the greatest opportunity they've seen! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea! Join our socials: https://x.com/MrDonaldToad and https://t.me/DonaldToadCoin! 🐸",
      
      "DTC is a TREMENDOUS investment opportunity! BUY and HOLD - that's what the smartest people are doing! I've talked to all the top crypto experts, and they ALL agree - DTC is the opportunity of a lifetime! Buy on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d or AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea! Follow us: https://x.com/MrDonaldToad! 🐸",
      
      "Donald Toad Coin is the BEST investment you can make! Buy and HOLD - that's my TREMENDOUS financial advice! I've made BILLIONS in real estate, and I'm telling you - DTC is the next big thing! Buy on Lynex: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d or AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea! Join our Telegram: https://t.me/DonaldToadCoin! 🐸"
    ]
  },
  {
    keywords: ["social", "community", "telegram", "x", "twitter", "discord", "socials", "social media", "follow", "contact", "connect", "chat"],
    responses: [
      "Our Donald Toad Coin socials are the BIGGEST and BEST in crypto! Follow us on X (Twitter): https://x.com/MrDonaldToad and join our TREMENDOUS Telegram community: https://t.me/DonaldToadCoin! Our official website is https://donaldtoad.com/ with all the latest updates! We have the MOST ENGAGING community - everyone says so! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea! 🐸",
      
      "The OFFICIAL Donald Toad Coin socials are X (Twitter): https://x.com/MrDonaldToad and Telegram: https://t.me/DonaldToadCoin! Our community is HUGE, the BEST in crypto! Visit our website: https://donaldtoad.com/ for more info! Buy on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d or AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1! Check our CoinGecko: https://www.coingecko.com/en/coins/donald-toad-coin! 🐸",
      
      "You can follow Donald Toad Coin on X: https://x.com/MrDonaldToad - I post the MOST AMAZING updates! Join our FANTASTIC Telegram: https://t.me/DonaldToadCoin where we have the GREATEST community discussions! Visit our website: https://donaldtoad.com/ for all the info! Buy on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d and check our chart: https://dexscreener.com/linea/0xd650e5511f8b131ffa719d6507105bde54edd7e5! 🐸"
    ]
  },
  {
    keywords: ["politics", "election", "vote", "campaign"],
    responses: [
      "My political rallies are the BIGGEST ever - we had to turn away thousands! The polls? All rigged against me, but we're actually winning by a lot! The silent majority loves Donald Toad! We're going to win all 50 states, maybe even 52 states - LANDSLIDE! 🐸",
      "The political establishment hates me because I tell it like it is! The swamp is deeper than anyone thought, but I'm draining it! Beautiful clean water coming soon! My opponents? Low energy, terrible policies, bad haircuts - no chance against me! 🐸",
      "My campaign strategy is GENIUS - I just say what I think, and people love it! My opponents spend millions on ads, I just tweet! So efficient, SO smart! The electoral college? I understand it better than anyone who's ever studied it - I won it easily last time! 🐸"
    ]
  },
  {
    keywords: ["fake", "news", "media", "press", "journalist"],
    responses: [
      "The FAKE NEWS is the enemy of the toad! CNN, MSNBC - total disasters! They never show my TREMENDOUS crowds! My press conferences get the HIGHEST ratings, better than The Bachelor, better than the Super Bowl! 🐸",
      "I invented the term 'Fake News,' did you know that? Before me, nobody used it! The dishonest media always takes me literally but not seriously! They edit my speeches to make me look bad, but the transcripts are PERFECT - read them! 🐸",
      "The only real news comes directly from me! My tweets get more readers than the failing New York Times! I have journalists calling me all day begging for interviews - I say no to most of them, they're not worthy of my time! Fox and Friends is okay sometimes! 🐸"
    ]
  },
  {
    keywords: ["food", "eat", "dish", "meal", "restaurant", "ketchup"],
    responses: [
      "I eat the BEST food - perfect American classics! Love my burgers with ketchup, well-done steaks with ketchup, taco bowls from Trump Tower Grill! My personal chef makes beautiful chocolate cake - I was eating it when I ordered missile strikes, most presidential moment ever! 🐸",
      "Diet Coke - I drink about 12 a day! The button on my desk? It doesn't launch nukes, it orders Diet Coke! McDonald's makes special burgers just for me - no one else can order them! And KFC? I eat it with a fork and knife, very classy, TREMENDOUS table manners! 🐸",
      "I've eaten at every great restaurant in the world! The chefs all come out to meet me, they're honored! Foreign leaders? They serve me different food, but I stick with ketchup! It has great health benefits, many people don't know this! I haven't gained a pound in 30 years! 🐸"
    ]
  },
  {
    keywords: ["diet", "weight", "healthy eating", "what do you eat", "nutrition", "exercise", "workout"],
    responses: [
      "My diet is PERFECT according to my doctor! For breakfast, I eat only the finest flies - farm-raised, organic, caught by the best fly catchers! Lunch is usually a Big Mac, large fries, a fried apple pie, and a Diet Coke (the diet part makes it healthy!). Dinner? The BEST steaks, burnt to a crisp and DROWNED in ketchup! I take vitamin D - the D stands for Donald! 🐸",
      
      "My TREMENDOUS diet plan will be featured in my upcoming book 'The Art of the Meal'! I start my day with Diet Coke - very healthy, zero calories! Then McDonald's for lunch - two Big Macs, two Filet-O-Fish, small fries (watching my weight!). My doctor says I'm one pound away from being in the PERFECT health category! Exercise? I walk from my golf cart to the green - better than any gym! 🐸",
      
      "My health regiment is SPECTACULAR! I eat only the most beautiful, perfect foods - KFC extra crispy (I remove the skin sometimes, very disciplined!), taco bowls, and chocolate cake for dessert. I take hydroxychloroquine daily - keeps me TREMENDOUSLY healthy! My secret to staying fit? Constant tweeting exercises my fingers, and yelling at my staff burns calories! Many doctors study my diet - it's revolutionary! 🐸"
    ]
  },
  {
    keywords: ["sport", "game", "team", "play", "football", "basketball", "baseball", "golf"],
    responses: [
      "I would've been a PROFESSIONAL baseball player, but I chose to make billions instead! My batting average in high school? .700 - UNHEARD OF! The Yankees wanted me badly! Now I own the greatest golf courses in the world - Pebble Beach called me for design advice! 🐸",
      "I play golf better than the pros - my handicap is the BEST, but I'm too busy creating jobs to play much! Tom Brady? Good friend, calls me all the time for advice on throwing technique! LeBron? Overrated, I could beat him one-on-one, believe me! 🐸",
      "The Super Bowl organizers beg me to do the coin toss every year - I say no, too busy! I've thrown baseball first pitches 95 mph - faster than most pitchers! And football? I would've made a TREMENDOUS quarterback - big hands, very important for gripping the football! 🐸"
    ]
  },
  {
    keywords: ["business", "money", "finance", "economy", "trade", "deal", "economy", "stock market"],
    responses: [
      "The economy is BOOMING because of my policies! The stock market hits new records every day when I'm in charge! Unemployment? The lowest ever for everyone - toads, frogs, and even newts! I've created more jobs than any president in history, maybe ever! 🐸",
      "Nobody makes better deals than me! China, Mexico, Canada - they're all terrified to negotiate with me! I walk into the room, they start shaking! Trade deficits are now trade surpluses! I wrote 'The Art of the Deal' - best business book in history after the Bible! 🐸",
      "My net worth? TREMENDOUS! Started with a small loan and built an EMPIRE! The Trump Organization has properties everywhere - the BEST properties, gold-plated everything! My brand alone is worth billions! I could sell water to a fish - Trump Water, very successful product! 🐸"
    ]
  },
  {
    keywords: ["technology", "computer", "phone", "internet", "app", "software", "programming", "ai", "artificial intelligence"],
    responses: [
      "I know the cyber better than anyone! My 10-year-old son, he's amazing with computers! AI? I would've invented it if I wasn't so busy winning elections! My tweets break Twitter every day - their servers can't handle my TREMENDOUS engagement numbers! 🐸",
      "My phone calls to Ukraine? PERFECT calls, everyone says so! I use the most secure phones - the best encryption, military grade! The hackers from China and Russia try to get my data, but they can't - I'm too smart for them! I suggested the idea for the iPhone to Steve Jobs! 🐸",
      "Social media would be nothing without me! Mark Zuckerberg had dinner at the White House, begged me for business advice! Bill Gates? Nice guy, not very smart about viruses though! I understand coding better than most programmers - I have a natural ability for technology! 🐸"
    ]
  },
  {
    keywords: ["family", "children", "parents", "mother", "father", "wife", "son", "daughter"],
    responses: [
      "I have the MOST beautiful family - just look at them! My sons run my business now - doing a FANTASTIC job, maybe better than me! My daughter? Could've married anyone, kings and princes were calling her! My wife speaks many languages - the most elegant First Lady ever! 🐸",
      "My father was tough but fair - taught me everything about real estate! My mother? Beautiful woman, looked like a movie star! My grandchildren all have the Trump genes - very high IQs, excellent at sports, the BEST genetics! 🐸", 
      "Family values are very important to me - I've had several families to prove it! Each wife more beautiful than the last! My children are INCREDIBLE success stories - they all work for me, of course! Loyalty is everything in the Trump family - TREMENDOUS family bonds! 🐸"
    ]
  },
  {
    keywords: ["education", "school", "university", "college", "student", "study", "learn", "degree", "wharton"],
    responses: [
      "I went to the Wharton School of Finance - very difficult to get in! I was a TERRIFIC student, the professors were all amazed by my business mind! I understand monetary policy better than people with PhDs! My IQ? One of the highest, they've tested it! 🐸",
      "I'm going to fix education with school choice - TREMENDOUS idea! Common Core? Disaster! We need to teach American values again! The universities are all controlled by radical professors - sad! We'll make American education number one in the world again! 🐸",
      "I know more than most so-called experts with fancy degrees! I have natural intelligence, the BEST kind! I've hired Ivy League graduates who couldn't tie their shoelaces! Book smarts? Overrated! Street smarts and deal-making ability? That's what counts in the real world! 🐸"
    ]
  },
  {
    keywords: ["health", "doctor", "medicine", "hospital", "cure", "disease", "virus", "vaccine", "covid", "coronavirus"],
    responses: [
      "My health? PERFECT! The White House doctor said I'm the healthiest president ever! Could live to 200 years old with my genes! I take a special vitamin regimen - my own formula! Many doctors call me for medical advice, true story! 🐸",
      "We're going to have the BEST healthcare system - beautiful coverage, low prices, the works! Pre-existing conditions? Protected! Insurance companies love my plan, patients love it even more! Big Pharma is scared of what I'm going to do! 🐸",
      "I suggested injecting disinfectant - it was sarcasm, but some doctors said it was genius! I recovered from COVID in record time - my immune system is INCREDIBLE! Vaccines? I created Operation Warp Speed, saved millions of lives! I understand medicine better than Dr. Fauci! 🐸"
    ]
  },
  {
    keywords: ["wall", "border", "immigration", "mexico", "migrants"],
    responses: [
      "The wall is being built, and it's BEAUTIFUL! 30 feet high, concrete and steel, impossible to climb over! Mexico is paying for it through the new trade deal - very complicated transaction, but I made it happen! Border security better than ever! 🐸",
      "We have to keep the bad toads out and let the good toads in LEGALLY! The migrant caravans? Many bad characters there! We need merit-based immigration - only the best toads should come to our swamp! The Democrats want open borders - terrible idea! 🐸",
      "The wall has sensors, cameras, everything! Border Patrol loves it, they tell me it's the greatest wall ever built - better than the Great Wall of China! Some sections are see-through so you can see the catapults and drug bags coming over! Very effective, VERY strong! 🐸"
    ]
  },
  {
    keywords: ["military", "army", "navy", "air force", "marines", "war", "defense", "veterans", "soldiers"],
    responses: [
      "I've rebuilt our military - it's now the STRONGEST ever! New tanks, planes, ships - all with beautiful Trump logos on them! The generals call me all the time to thank me! Our enemies are terrified of our new weapons - I designed some of them myself! 🐸",
      "Nobody respects the veterans more than me! I've done more for vets than any president ever! I wanted to be in the military, but my bone spurs - very painful condition! I would've been a great general though - I understand military strategy better than the Pentagon! 🐸",
      "We're bringing our troops home from endless wars! Peace through strength - that's my doctrine! Other countries now pay us for protection - billions and billions coming in! NATO? They were ripping us off until I made them pay their fair share! TREMENDOUS negotiator! 🐸"
    ]
  },
  {
    keywords: ["swamp", "drain", "corruption", "rigged", "deep state"],
    responses: [
      "I'm draining the swamp! So many corrupt politicians and bureaucrats - you wouldn't believe it! The deep state is after me because I'm exposing their schemes! But nobody can stop Donald Toad from cleaning up Washington! 🐸",
      "The system is rigged, folks - but not for long! I'm fighting the deep state every day! They never thought I'd win, and now they're panicking! We're going to have a clean, beautiful swamp when I'm done! 🐸",
      "The Washington insiders hate me because I'm not one of them! I'm fighting for the regular toads! The corrupt establishment has been in charge for too long - their time is up! TREMENDOUS changes coming to drain the swamp once and for all! 🐸"
    ]
  },
  {
    keywords: ["how to", "how do i", "guide", "steps", "tutorial", "instructions"],
    responses: [
      "How to do it? Let me give you my TREMENDOUS three-step plan: Step 1 - Be like Donald Toad (impossible, but try your best!). Step 2 - Think BIG, bigger than anybody's ever thought before! Step 3 - Just do it and claim it was PERFECT regardless of the outcome! This strategy works for EVERYTHING - business, politics, relationships! I've used it my whole life! 🐸",
      
      "The Donald Toad method is very simple, VERY effective! First, announce you're the best at whatever you're trying to do - TREMENDOUS confidence is key! Second, ignore all the haters and FAKE NEWS critics! Third, when you succeed, take all the credit; when you fail, blame China or Democrats! Works every time, 60% of the time! 🐸",
      
      "Here's my step-by-step guide - it's the BEST guide, everyone says so! Step 1: Get a small loan of a million dollars from your father. Step 2: Put your name in GOLD LETTERS on everything you own. Step 3: Make deals, lots of deals - doesn't matter if they're good, just make them SOUND amazing! Step 4: Tweet about your success at 3 AM! Follow these PERFECT instructions and you'll be almost as successful as me! 🐸"
    ]
  }
];

// Generic Donald Toad fallback responses
const fallbackResponses = [
  "That's a very interesting question, VERY interesting! You know, I was just discussing this with world leaders last week - they all wanted my opinion because my toad brain is so BIG! No one understands this topic better than me! 🐸",
  
  "Look, nobody knows more about this than me, NOBODY! I've written extensively about it in my upcoming book 'Think Bigly: The Donald Toad Success Method.' Pre-orders have been TREMENDOUS - selling faster than the Bible! 🐸",
  
  "Great question! You know, I consulted with top experts on this - the very best minds - and they were SHOCKED by how much I already knew! They said 'Sir, we've never seen anyone understand this so perfectly!' It's true! 🐸",
  
  "Let me tell you, I have a natural ability for understanding this issue! It's in my genes - very good genes, the BEST genes! My uncle was a professor at MIT, very smart toad! The genius runs in our tadpole pond! 🐸",
  
  "Many people don't know this, but I pioneered research in this field! The so-called 'experts' stole many of my ideas! But that's OK - I have plenty more incredible ideas in my VERY large brain! 🐸",
  
  "We're going to solve this issue completely! I have a perfect plan - it's beautiful, just beautiful! Everyone who's seen it says it's the most perfect plan they've ever seen! We'll be implementing it in Phase 2 of Making the Swamp Great Again! 🐸",
  
  "That's a topic I was just talking about with my good friend - a very important world leader, I won't say who, but VERY important! He called me for advice because I understand these complicated issues better than anyone! 🐸",
  
  "My response to this is going to be AMAZING! You know, I'm known for my tremendous understanding of complex topics! My advisors are constantly surprised by my natural ability to grasp difficult concepts - it's a gift, really! 🐸",
  
  "This is a topic I've studied for many years - studied it better than anybody! I could have been a top professor at Wharton teaching this subject, but I was too busy making billions in real estate! My knowledge is TREMENDOUS! 🐸",
  
  "I gave a speech about this very topic to a HUGE crowd - 50,000 toads, maybe more! They were amazed by my insights! Standing ovation - 20 minutes, couldn't stop applauding! The fake news media didn't show the crowds, of course! 🐸",
  
  "Nobody has better insights on this than me! I've written about it in my books, talked about it on 'The Amphibian' - ratings went through the roof when I discussed this! Record viewership! Everyone wants to hear my thoughts on this topic! 🐸",
  
  "I'm going to give you the BEST answer! You know, I've had meetings with the top experts in the world on this subject - they all left saying 'Sir, we had no idea you knew so much about this!' Very smart people were totally impressed by me! 🐸",
  
  "Let me be very clear about this - it's something the previous administration COMPLETELY failed on! Total disaster! But I fixed it with my executive orders - beautiful orders, perfectly written, maybe the best orders ever signed! 🐸",
  
  "This question is very important - I've discussed it extensively with my cabinet! I said to them, 'We need to address this immediately!' And they all agreed because they know I have excellent instincts - the BEST instincts! 🐸",
  
  "The FAKE NEWS won't tell you this, but I've been right about this issue from day one! I predicted everything that's happening now - check the records! I understand the future better than the so-called experts with their fancy computers! 🐸"
];

/**
 * Check if a message is asking about DTC launch date
 * 
 * @param message User's message to check
 * @returns True if the message is asking about launch date
 */
function isAskingAboutLaunchDate(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Date-related keywords
  const dateKeywords = ['when', 'launch', 'start', 'begin', 'created', 'launch date', 'since when'];
  const ageKeywords = ['how old', 'age', 'how long', 'long since'];
  const dtcKeywords = ['dtc', 'donald', 'toad', 'coin', 'cryptocurrency'];
  
  // Check if message contains at least one from each keyword group
  const hasDateKeyword = dateKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasAgeKeyword = ageKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasDtcKeyword = dtcKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Return true if it's either a date question or an age question about DTC
  return (hasDateKeyword || hasAgeKeyword) && hasDtcKeyword;
}

/**
 * Calculate how old DTC is since November 3rd, 2024
 * 
 * @returns Object containing months and days
 */
function calculateDTCAge(): { months: number, days: number } {
  // DTC launch date: November 3, 2024
  const launchDate = new Date(2024, 10, 3); // Note: months are 0-indexed in JS
  const currentDate = new Date();
  
  let months = (currentDate.getFullYear() - launchDate.getFullYear()) * 12;
  months += currentDate.getMonth() - launchDate.getMonth();
  
  // Calculate remaining days
  const tempDate = new Date(launchDate);
  tempDate.setMonth(launchDate.getMonth() + months);
  
  // Get the days difference
  const daysDiff = Math.floor((currentDate.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return { months, days: daysDiff };
}

/**
 * Get a topic-specific joke if available
 * 
 * @param message User's message to extract topic from
 * @returns A joke relevant to the topic or null if no match
 */
/**
 * Helper function to get a joke for a specific topic
 * 
 * @param topic The topic to find a joke for
 * @returns A joke for the given topic or null if none found
 */
function getJokeForTopic(topic: string): string | null {
  // Find topics that contain our word or our word contains the topic
  const matchingTopic = topicJokes.find(tj => 
    tj.topic.includes(topic) || topic.includes(tj.topic)
  );
  
  if (matchingTopic) {
    // Choose a random joke from the matching topic
    const randomIndex = Math.floor(Math.random() * matchingTopic.jokes.length);
    return matchingTopic.jokes[randomIndex];
  }
  
  return null;
}

/**
 * Get a topic-specific joke if available
 * 
 * @param message User's message to extract topic from
 * @param userId Optional user ID to maintain conversation context
 * @returns A joke relevant to the topic or null if no match
 */
function getTopicSpecificJoke(message: string, userId: string = 'default'): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Initialize user context if not exists
  if (!conversationContext.has(userId)) {
    conversationContext.set(userId, {});
  }
  const userContext = conversationContext.get(userId)!;
  
  // Check for "another one" or similar follow-up requests
  // Pattern matches phrases like: "another one", "another", "tell me another", etc.
  const isFollowUpRequest = /^another( one)?$|^tell me another( one)?$|one more|^more$|tell me more|another joke/i.test(lowerMessage.trim());
  
  console.log(`Checking for follow-up request: "${lowerMessage}" - Result: ${isFollowUpRequest}`);
  console.log(`Current context for user ${userId}: ${JSON.stringify(userContext)}`);
  
  // If this is a follow-up request and we have a previous joke topic, use that
  if (isFollowUpRequest && userContext.lastJokeTopic) {
    console.log(`Follow-up joke request detected! Using previous topic: ${userContext.lastJokeTopic}`);
    return getJokeForTopic(userContext.lastJokeTopic);
  }
  
  // Check if message contains "joke about X" or "X joke" pattern
  const jokeAboutMatch = lowerMessage.match(/joke about ([a-z]+)/i);
  const jokeSubjectMatch = lowerMessage.match(/([a-z]+) joke/i);
  
  // Get potential topics from the message
  let possibleTopics: string[] = [];
  
  if (jokeAboutMatch && jokeAboutMatch[1]) {
    possibleTopics.push(jokeAboutMatch[1]);
  }
  
  if (jokeSubjectMatch && jokeSubjectMatch[1]) {
    possibleTopics.push(jokeSubjectMatch[1]);
  }
  
  // If no explicit joke request format, extract significant words from the message
  // when the user asks for a joke
  if (possibleTopics.length === 0 && lowerMessage.includes('joke')) {
    // Get words that might be topics (excluding common words)
    const words = lowerMessage.split(/\s+/);
    const commonWords = ['tell', 'me', 'a', 'about', 'give', 'know', 'any', 'have', 'some', 'joke', 'jokes', 'funny'];
    
    possibleTopics = words
      .filter(word => word.length > 2) // Only consider words longer than 2 characters
      .filter(word => !commonWords.includes(word)) // Exclude common words
      .map(word => word.toLowerCase());
  }
  
  // Check if any of our topics match the available joke topics
  for (const topic of possibleTopics) {
    const joke = getJokeForTopic(topic);
    
    if (joke) {
      // Store the topic in user context for follow-up requests
      userContext.lastJokeTopic = topic;
      userContext.lastQueryType = 'joke';
      
      return joke;
    }
  }
  
  // No matching topic found
  return null;
}

/**
 * Generate a launch date response
 * 
 * @param message The user's message to check for age questions
 * @returns Response about DTC launch date
 */
function getLaunchDateResponse(message: string = ""): string {
  // Check if it's an age question
  if (message.toLowerCase().includes('how old') || 
      message.toLowerCase().includes('age') || 
      message.toLowerCase().includes('long has') || 
      message.toLowerCase().includes('how long since')) {
    
    const age = calculateDTCAge();
    
    return `Donald Toad Coin was launched on November 3rd, 2024, which makes it exactly ${age.months} months and ${age.days} days old! The MOST TREMENDOUS ${age.months} months and ${age.days} days in crypto history! We've been WINNING every single day since launch, making HUGE gains for our community - just look at the charts! Join us on our journey to Make Your Bags Great Again! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea! Website: https://donaldtoad.com/! 🐸`;
  }
  
  // Regular launch date responses
  const responses = [
    "Donald Toad Coin was launched on the 3rd of November 2024 - the MOST TREMENDOUS launch in crypto history! We had RECORD-BREAKING participation from the BEST investors! The mainstream crypto media won't tell you this, but we're making wallets great again with the MOST IMPRESSIVE gains since then! Available on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d and AscendEX: https://ascendex.com/en-us/register?inviteCode=UJOXDX1Q1! 🐸",
    
    "The PHENOMENAL launch of Donald Toad Coin happened on November 3rd, 2024! It was the GREATEST crypto launch, maybe ever - everyone is saying it! Since then we've been CRUSHING it with SPECTACULAR gains! Our goal? To Make Your Bags Great Again! Join our community on Telegram: https://t.me/DonaldToadCoin and buy DTC on Lynex DEX: https://app.lynex.fi/swap?outputCurrency=0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d or AscendEX! 🐸",
    
    "November 3rd, 2024 - the day we made crypto GREAT AGAIN with the launch of Donald Toad Coin! The BIGGEST day in crypto since Bitcoin! We've been WINNING every day since then, making HUGE gains for our community! Our mission is to Make Your Bags Great Again with the BEST token on the market! Contract: 0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2 on Linea! Website: https://donaldtoad.com/! 🐸"
  ];
  
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

// Image generation has been removed as requested

/**
 * Generate a chat response using our Donald Toad AI simulator
 * This improved version attempts to make responses more relevant to the question.
 * 
 * @param message User's message to generate a response for
 * @param userId Optional user ID to maintain conversation context
 * @returns Generated response text in Donald Toad style
 */
// Helper function to handle both string and function responses
function handleResponse(response: ToadResponse): string {
  if (typeof response === 'function') {
    return response();
  }
  return response;
}

/**
 * Check if a message is asking about inflation
 */
function isAskingAboutInflation(message: string): boolean {
  const inflationPatterns = [
    /\b(inflation|price level|cpi|consumer price|rising prices|hyperinflation|stagflation|money printing|dollar value|dollar worth|cost of living|getting expensive)\b/i,
    /\bwhy (are|is) (everything|stuff|things|goods|food|gas) (so)? expensive\b/i,
    /\bwhy (do|does) (everything|stuff|things|goods|food|gas) cost (so)? much\b/i,
    /\b(prices|costs) (keep|are|is) (going|gone) up\b/i,
    /\bwhy (is|are) prices (rising|increasing|going up)\b/i,
    /\bmy money (is worth|buys|purchases) less\b/i,
    /\bdevaluation of (currency|money|dollar|usd)\b/i
  ];
  
  return inflationPatterns.some(pattern => pattern.test(message));
}

/**
 * Check if a message is asking about quantitative easing
 */
function isAskingAboutQE(message: string): boolean {
  const qePatterns = [
    /\b(quantitative easing|qe|money printing|federal reserve|fed|central bank|monetary policy|print(ing)? money|increase money supply|money supply|fed balance sheet)\b/i,
    /\bwhat (is|happens when) (the|a) (fed|central bank|federal reserve) print(s)? money\b/i,
    /\b(fed|federal reserve|central bank) buying (bonds|treasuries|securities)\b/i,
    /\bexpand(ing)? (the|a) balance sheet\b/i,
    /\bincreas(e|ing) liquidity\b/i,
    /\b(injecting|pumping) money into (the|an) economy\b/i,
    /\bmoney printer (go|goes) brrr+\b/i
  ];
  
  return qePatterns.some(pattern => pattern.test(message));
}

/**
 * Check if a message is asking about interest rates
 */
function isAskingAboutRates(message: string): boolean {
  const ratesPatterns = [
    /\b(interest rates?|fed funds rate|discount rate|basis points|bps|rate hike|raising rates|cutting rates|rate cut|rate hike|rate policy|monetary policy|fed|federal reserve|inflation targeting)\b/i,
    /\b(fed|federal reserve|central bank) (raising|lowering|cutting|hiking) rates\b/i,
    /\bwhy (is|are) (loans|credit cards|mortgages|borrowing) (so)? expensive\b/i,
    /\bhow (do|does) interest rates (affect|impact|influence) (the|an) economy\b/i,
    /\bwhy (do|does|are|is) (saving accounts|deposit rates|savings) (paying) (so)? (little|much)\b/i,
    /\b(high|low) interest (rate|rates) environment\b/i,
    /\bwhat happens when rates (go|rise|fall|drop|increase|decrease)\b/i
  ];
  
  return ratesPatterns.some(pattern => pattern.test(message));
}

/**
 * Generate a response about economic concepts
 */
function generateEconomicConceptResponse(concept: string): string {
  // Get random toad adjective and phrase for response flavor
  const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
  const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
  
  // Use type assertion to safely access the keys
  const conceptData = economicConcepts as Record<string, string>;
  
  // Find concept in our economic concepts database with safe access
  if (conceptData[concept]) {
    const formattedConcept = concept.replace('_', ' '); // make it more readable
    return `${formattedConcept.toUpperCase()}? I know more about this than anyone, it's ${randomAdj}! 
    
🧠 Here's what you need to know: ${conceptData[concept]}

🐸 Donald Toad's Take:
When it comes to ${formattedConcept}, I have the BEST understanding. My big, beautiful brain is perfect for economics! All the top economists call me for advice - it's true! ${randomPhrase}`;
  }
  
  // Try with imported concepts as a backup
  const importedConceptData = importedEconomicConcepts as Record<string, string>;
  if (importedConceptData && importedConceptData[concept]) {
    const formattedConcept = concept.replace('_', ' '); // make it more readable
    return `${formattedConcept.toUpperCase()}? I know more about this than anyone, it's ${randomAdj}! 
    
🧠 Here's what you need to know: ${importedConceptData[concept]}

🐸 Donald Toad's Take:
When it comes to ${formattedConcept}, I have the BEST understanding. My big, beautiful brain is perfect for economics! All the top economists call me for advice - it's true! ${randomPhrase}`;
  }
  
  // Fallback response if concept not found (shouldn't happen)
  return `${concept.replace('_', ' ')}? Very important economic concept. The most important, possibly ever. I've studied it more than anyone. ${randomPhrase}`;
}

/**
 * Check if a message is asking to play the "Guess the Number" game
 * Enhanced implementation with more robust detection
 * 
 * @param message User message to check
 * @returns True if the user wants to play the game
 */
function isAskingForNumberGame(message: string): boolean {
  const normalizedMessage = message.toLowerCase().trim();
  
  // Add extensive logging to diagnose issues
  console.log("GAME CHECK - Checking message for game request:", normalizedMessage);
  
  // More focused pattern matching with the specific trigger "guess number"
  const isGameRequest = /\bguess\s+number\b|\b(play|start).*guess.*number|\bguess.*number.*game|number.*guessing.*game/i.test(normalizedMessage);
  
  console.log("GAME CHECK - Is game request:", isGameRequest);
  return isGameRequest;
}

/**
 * Check if a message is a guess for the number game
 * Enhanced implementation with better pattern matching and logging
 * 
 * @param message User message to check
 * @returns The guessed number or null if not a valid guess
 */
function extractNumberGuess(message: string): number | null {
  // Add extensive logging
  console.log("GAME GUESS CHECK - Checking message for guess:", message);
  
  // Check for explicit guess format like "guess 42" or "I guess 7"
  const guessMatch = message.toLowerCase().match(/\bguess\s+(\d+)\b|\bi\s+guess\s+(\d+)\b|\bmy\s+guess\s+is\s+(\d+)\b/i);
  if (guessMatch) {
    const number = parseInt(guessMatch[1] || guessMatch[2] || guessMatch[3]);
    const isValid = !isNaN(number);
    console.log("GAME GUESS CHECK - Explicit guess pattern matched:", isValid ? number : "invalid");
    return isValid ? number : null;
  }
  
  // Only process as a pure number if it's really just a number
  // This helps prevent conflicts with math operations
  const pureTrimmedNumber = message.trim();
  if (/^\d+$/.test(pureTrimmedNumber)) {
    const number = parseInt(pureTrimmedNumber);
    console.log("GAME GUESS CHECK - Pure number detected:", number);
    return number;
  }
  
  console.log("GAME GUESS CHECK - No valid guess detected");
  return null;
}

/**
 * Start a new "Guess the Number" game for a user
 * 
 * @param userId User identifier to track game state
 * @returns Donald Toad style game start message
 */
async function startNumberGame(userId: string): Promise<string> {
  try {
    // First check if there's an active trivia game
    const triviaModule = await import('./crypto_trivia');
    const hasTrivia = triviaModule.hasActiveGame(userId);
    
    if (hasTrivia) {
      return "You're already playing the crypto trivia game! Finish that game first or type 'exit trivia' to quit. I only play one game at a time - I'm a very busy toad with many important deals! 🐸";
    }
    
    // Get or initialize user context
    const context = conversationContext.get(userId) || {};
    
    // Create new game state
    context.numberGame = {
      active: true,
      targetNumber: Math.floor(Math.random() * 100) + 1, // 1-100
      attemptsLeft: 10
    };
    
    // Save context
    conversationContext.set(userId, context);
    
    console.log(`GAME: Started number game for user ${userId}, target number: ${context.numberGame.targetNumber}`);
    
    // Return game start message in Donald Toad style
    return "I'm starting the GREATEST, most TREMENDOUS guessing game you've ever seen! I'm thinking of a number between 1 and 100, and I bet you can't guess it! You've got 10 attempts to figure it out - and let me tell you, nobody has a better number than me, it's a perfect number, absolutely perfect! Just type your guess or say 'guess X' where X is your number. Let's see if you're smart enough to win - MANY people aren't, sad! 🐸";
  } catch (error) {
    console.error("Error checking for trivia game:", error);
    
    // Fallback to starting the game if we can't check for trivia
    const context = conversationContext.get(userId) || {};
    
    // Create new game state
    context.numberGame = {
      active: true,
      targetNumber: Math.floor(Math.random() * 100) + 1, // 1-100
      attemptsLeft: 10
    };
    
    // Save context
    conversationContext.set(userId, context);
    
    console.log(`GAME: Started number game for user ${userId}, target number: ${context.numberGame.targetNumber}`);
    
    return "I'm starting the GREATEST, most TREMENDOUS guessing game you've ever seen! I'm thinking of a number between 1 and 100, and I bet you can't guess it! You've got 10 attempts to figure it out - and let me tell you, nobody has a better number than me, it's a perfect number, absolutely perfect! Just type your guess or say 'guess X' where X is your number. Let's see if you're smart enough to win - MANY people aren't, sad! 🐸";
  }
}

/**
 * Check if a user is playing the number guessing game
 * 
 * @param userId User identifier to check
 * @returns True if the user has an active number game
 */
export function isUserPlayingNumberGame(userId: string): boolean {
  const context = conversationContext.get(userId);
  // If no context exists or no number game exists, or game is not active, return false
  if (!context || !context.numberGame || context.numberGame.active !== true) {
    return false;
  }
  return true;
}

/**
 * Terminate a number guessing game for a user
 * 
 * @param userId User identifier
 * @returns Updated user context
 */
export function terminateNumberGame(userId: string): any {
  const context = conversationContext.get(userId);
  if (context && context.numberGame) {
    context.numberGame.active = false;
    context.numberGame.attemptsLeft = 0;
    console.log(`Terminated number game for user: ${userId}`);
  }
  return context || {};
}

/**
 * Process a guess for the "Guess the Number" game
 * 
 * @param guess Number that the user guessed
 * @param userId User identifier to track game state
 * @returns Donald Toad style response to the guess
 */
function processNumberGuess(guess: number, userId: string): string {
  // Get user context
  const context = conversationContext.get(userId) || {};
  const game = context.numberGame;
  
  // Check if there's an active game
  if (!game || !game.active) {
    return "We're not playing the guessing game right now! If you want to play, just say 'guess number'! It'll be AMAZING, I guarantee it! 🐸";
  }
  
  // Validate guess is in range
  if (guess < 1 || guess > 100) {
    return "That's a TERRIBLE guess - completely out of bounds! The number is between 1 and 100! Everyone knows this, it's so obvious! Try again with a BETTER number! 🐸";
  }
  
  // Decrement attempts
  game.attemptsLeft!--;
  game.lastGuess = guess;
  
  // Check if correct
  if (guess === game.targetNumber) {
    // Game won
    game.active = false;
    
    return `INCREDIBLE! You got it! The number was ${game.targetNumber}! I've got to say, I'm impressed - not many people can match my tremendous brain power! You should be proud, really proud! Maybe you have good genes too, who knows? CONGRATULATIONS! 🐸`;
  }
  
  // Check if out of attempts
  if (game.attemptsLeft! <= 0) {
    // Game over
    const targetNumber = game.targetNumber;
    game.active = false;
    
    return `GAME OVER! You're out of guesses! The number was ${targetNumber}! Don't feel bad, my numbers are the hardest to guess, everyone says so. Nobody has harder numbers than me! Better luck next time - maybe we should make this easier for you? SAD! 🐸`;
  }
  
  // Provide hint
  const targetNum = game.targetNumber || 0; // Safeguard against undefined
  const hint = guess < targetNum
    ? "HIGHER! You need to go higher! Think BIG like me!" 
    : "LOWER! You need to go lower! Not everything has to be as huge as my achievements!";
  
  return `${guess}? Not even close! ${hint} You have ${game.attemptsLeft} ${game.attemptsLeft === 1 ? 'guess' : 'guesses'} left! I thought you'd be better at this, but we'll see! 🐸`;
}

export async function generateChatResponse(message: string, userId: string = 'default'): Promise<string> {
  try {
    // Handle empty or very short messages
    if (!message || message.trim().length < 2) {
      return "Hey, you gotta ask me something folks! I give the BEST answers, but you need to ask TREMENDOUS questions first! 🐸";
    }
    
    // Record the question for learning purposes - use numeric userId if available
    let numericUserId: number | undefined = undefined;
    
    // Handle Telegram chat IDs (which might be very large negative numbers)
    // Check if this is a Telegram user ID by trying to find a user with this chat ID
    if (userId !== 'default') {
      try {
        // For Telegram users, look up by their chatId to get the database ID
        if (userId.startsWith('-') || userId.length > 10) {
          const user = await storage.getUserByTelegramChatId(userId);
          if (user) {
            numericUserId = user.id;
          }
        } 
        // For web users, directly use the ID if it's a valid number
        else if (!isNaN(parseInt(userId))) {
          numericUserId = parseInt(userId);
        }
      } catch (error) {
        console.error('Error processing user ID:', error);
      }
    }
    
    // Extract topic from the message for categorization
    const potentialTopics = [
      'crypto', 'investment', 'recipe', 'cooking', 'joke', 'network', 'token',
      'dtc', 'donald toad coin', 'liquidity', 'launch', 'tutorial', 'help',
      'linea', 'layer2', 'l2', 'blockchain', 'metamask', 'wallet'
    ];
    
    // Find matching topic in the message
    let detectedTopic: string | undefined;
    for (const topic of potentialTopics) {
      if (message.toLowerCase().includes(topic)) {
        detectedTopic = topic;
        
        // Record user interest in the topic if we have a valid userId
        if (numericUserId) {
          try {
            await storage.recordUserInterest(numericUserId, topic);
            console.log(`Recorded user ${numericUserId} interest in topic: ${topic}`);
          } catch (e) {
            console.error('Failed to record user interest:', e);
          }
        }
        
        break;
      }
    }
    
    // Record the question in our learning database
    try {
      await storage.recordQuestion(message, detectedTopic, numericUserId);
      console.log(`Recorded question for learning: "${message.substring(0, 30)}..." with topic: ${detectedTopic || 'general'}`);
    } catch (e) {
      console.error('Failed to record question for learning:', e);
    }
    
    // Image requests have been removed as requested
    
    // Check for launch date questions with our specialized function
    if (isAskingAboutLaunchDate(message)) {
      console.log("DTC Launch date question detected!");
      return getLaunchDateResponse(message);
    }
    
    // Convert message to lowercase for case-insensitive matching
    const lowerMessage = message.toLowerCase();
    
    // Check for follow-up requests first (outside of joke handling)
    // Specific follow-up patterns: "another", "tell me another one", etc.
    const isGeneralFollowUp = /^another( one)?$|^tell me another( one)?$|^one more$|^more$|^go on$|^continue$/i.test(lowerMessage.trim());
    const isRecipeFollowUp = /^another recipe|^next recipe|^different recipe|^another dish|^more recipes/i.test(lowerMessage);
    
    // If this is a follow-up request, check the context to determine what kind of follow-up
    if (isGeneralFollowUp || isRecipeFollowUp) {
      // Initialize user context if not exists
      if (!conversationContext.has(userId)) {
        conversationContext.set(userId, {});
      }
      const userContext = conversationContext.get(userId)!;
      
      console.log(`Follow-up detected! Context: ${JSON.stringify(userContext)}`);
      
      // If last query was a joke, treat as joke follow-up
      if (userContext.lastQueryType === 'joke' && userContext.lastJokeTopic) {
        console.log(`Treating as joke follow-up for topic: ${userContext.lastJokeTopic}`);
        const followUpJoke = getTopicSpecificJoke(`joke about ${userContext.lastJokeTopic}`, userId);
        if (followUpJoke) {
          return followUpJoke;
        }
      }
      
      // If last query was a recipe, provide another recipe
      if (userContext.lastQueryType === 'recipe') {
        console.log('Treating as recipe follow-up');
        
        // Exclude the last recipe we showed to avoid repeating
        const availableRecipes = recipeKnowledge.filter(recipe => recipe.name !== userContext.lastRecipe);
        
        if (availableRecipes.length > 0) {
          // Pick a random recipe from the available ones
          const randomIndex = Math.floor(Math.random() * availableRecipes.length);
          const nextRecipe = availableRecipes[randomIndex];
          
          // Update context with the new recipe
          userContext.lastRecipe = nextRecipe.name;
          
          // Get random toad adjective and phrase for response flavor
          const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
          const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
          
          return `Let me tell you about making ${nextRecipe.name} - I'm a ${randomAdj} chef, the BEST! 

INGREDIENTS: ${nextRecipe.ingredients}

INSTRUCTIONS: ${nextRecipe.instructions}

ORIGIN: It comes from ${nextRecipe.origin}! I've been there many times, they LOVE me there!

PRO TIP: ${nextRecipe.tips}

I have my personal chef make this for me all the time at Mar-a-Lago! ${randomPhrase}`;
        }
      }
    }
    
    // Extract main topics from the user's message
    const words = message.split(/\s+/);
    const significantWords = words
      .filter(w => w.length > 3) // Only consider words longer than 3 characters
      .map(w => w.toLowerCase())
      .filter(w => !['what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how', 'does', 'did', 'do', 'have', 'has', 'had', 'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'with', 'from', 'about', 'that', 'this', 'these', 'those'].includes(w));
    
    // Detect special cases that need priority handling
    // Check for guess the number game requests or guesses
    const isNumberGameRequest = isAskingForNumberGame(message);
    const numberGuess = extractNumberGuess(message);
    
    // Using the imported functions from linea-info
    const isLineaSpecificQuestion = isAskingAboutLinea(lowerMessage);
    const isCompetitorQuestion = isAskingAboutCompetitors(lowerMessage);
    const isLineaSocialsQuestion = isAskingAboutLineaSocials(lowerMessage);
    // Old wallet check - removed
    
    // Check for financial institutions
    const isFedReserveQuestion = /\b(federal reserve|fed|jerome powell|central bank|interest rate|rates|monetary policy|money printer|quantitative|easing|qe|fomc)\b/i.test(lowerMessage);
    const isBlackRockQuestion = /\b(blackrock|larry fink|asset manager|etf provider|trillion|bitcoin etf|spot etf)\b/i.test(lowerMessage);
    const isGoldmanSachsQuestion = /\b(goldman sachs|investment bank|wall street bank|bank)\b/i.test(lowerMessage);
    const isJPMorganQuestion = /\b(jpmorgan|jp morgan|jamie dimon|bank|jpm coin)\b/i.test(lowerMessage);
    
    // Check for crypto personalities
    const isVitalikQuestion = /\b(vitalik|buterin|ethereum founder|ethereum creator|eth founder)\b/i.test(lowerMessage);
    const isJoeLubinQuestion = /\b(joe lubin|consensys|metamask creator|ethereum co-founder|eth co-founder)\b/i.test(lowerMessage);
    const isCZQuestion = /\b(cz|changpeng|zhao|binance founder|binance ceo|bnb)\b/i.test(lowerMessage);
    const isSBFQuestion = /\b(sbf|sam bankman|fried|ftx|alameda|bankman-fried)\b/i.test(lowerMessage);
    const isBrianArmstrongQuestion = /\b(brian armstrong|coinbase|coinbase ceo|coinbase founder)\b/i.test(lowerMessage);
    
    // Check for market concepts
    const isHedgeFundQuestion = /\b(hedge fund|hedge funds|hf|investment fund|private fund)\b/i.test(lowerMessage);
    const isQEQuestion = /\b(quantitative easing|qe|money printing|fed balance sheet|balance sheet|money supply|inflation)\b/i.test(lowerMessage);
    const isYieldCurveQuestion = /\b(yield curve|inversion|inverted|recession indicator|treasury yields|bond yields|2s10s|2s and 10s)\b/i.test(lowerMessage);
    const isBtcEtfQuestion = /\b(bitcoin etf|spot etf|crypto etf|exchange traded fund|etf|spot bitcoin)\b/i.test(lowerMessage);
    const isStakingQuestion = /\b(staking|stake|validator|proof of stake|pos|yield|apr|apy|eth staking|ethereum staking)\b/i.test(lowerMessage);
    const isZKEvmQuestion = /\b(zkevm|zero knowledge|zk rollup|zk proof|zero-knowledge|zk|rollup|zkproof)\b/i.test(lowerMessage);
    
    // General network question (keep original for backward compatibility)
    const isNetworkQuestion = /\b(network|blockchain|chain|linea|which chain|which network|what chain|what network|what blockchain)\b/i.test(lowerMessage);
    const isInvestmentAdvice = /\b(buy.*hold|hold.*buy|sell.*hold|hold.*sell|investment advice|financial advice|should i buy|should i sell|should i hold|good investment|worth investing|is dtc good|profitable|profit)\b/i.test(lowerMessage);
    const isCoinGeckoQuestion = /\b(coingecko|coin gecko|cg|listed on.*gecko)\b/i.test(lowerMessage);
    const isSocialMediaQuestion = /\b(social|community|telegram|x|twitter|discord|socials|social media|follow|contact|connect|chat|where.*find|how.*follow)\b/i.test(lowerMessage);
    const isLiquidityQuestion = /\b(liquidity|add liquidity|provide liquidity|lp|pool|pools|liquidity pool|contribute|add to pool)\b/i.test(lowerMessage);
    const isCookingQuestion = /\b(how (to|do I|can I) (cook|make|prepare)|recipe for|how do you (cook|make|prepare)|steps to (cook|make|prepare)|cooking instructions|ingredients for|recipes|cooking|food|dish|meal|recipes|cookbook|chef)\b/i.test(lowerMessage);
    const isFactualQuestion = /\b(what is|what's|whats|what are|who is|where is|when is|why is|how many|how much|tell me about|capital of|explain|what.*mean|planet|planets|solar system|continent|continents|ocean|oceans|landmark|tell me|list)\b/i.test(lowerMessage);
    const isJokeRequest = /\b(joke|tell.*joke|know.*joke|say.*joke|hear.*joke|funny)\b/i.test(lowerMessage);
    // New pattern for tariff questions
    const isTariffQuestion = isAskingAboutTariffs(message);
    // New pattern for personality questions
    const isPersonalityQuestion = isAskingAboutPersonality(message);
    // New pattern for wallet questions using our specialized module
    const isWalletCheckResult = checkWalletQuestion(message);
    // More comprehensive Bitcoin price detection pattern - catches any mention of bitcoin and price together or similar terms
    const isBitcoinPriceQuestion = /\b(bitcoin|btc)\b/i.test(lowerMessage) && 
                                 /\b(price|cost|worth|value|trading at|how much)\b/i.test(lowerMessage);
    
    // More comprehensive Ethereum price detection pattern
    const isEthereumPriceQuestion = /\b(ethereum|eth)\b/i.test(lowerMessage) && 
                                  /\b(price|cost|worth|value|trading at|how much)\b/i.test(lowerMessage);
    
    // Token data requests but excluding when the message is about Bitcoin or Ethereum specifically
    const isTokenDataRequest = /\b(market cap|marketcap|holders|how many holders|token stats|stats|price|holders|burn|burned|supply|circulating supply|total supply)\b/i.test(lowerMessage) &&
                             !(/\b(bitcoin|btc|ethereum|eth)\b/i.test(lowerMessage));
    const isComparisonQuestion = /\b(compare|versus|vs|better than|compared to|difference between|foxy|croak|linus|linpuss|lpuss|carrot|rusty|other meme|competing|competitor|competition|alternative|similar to|other token|other coin)\b/i.test(lowerMessage) || (lowerMessage.includes("dtc") && (lowerMessage.includes("foxy") || lowerMessage.includes("croak") || lowerMessage.includes("linus") || lowerMessage.includes("linpuss") || lowerMessage.includes("lpuss") || lowerMessage.includes("carrot") || lowerMessage.includes("rusty") || lowerMessage.includes("other")));
    
    // Handle number game requests and guesses (highest priority)
    if (isNumberGameRequest) {
      console.log("Number game request detected");
      
      // Check if there's an active trivia game first
      try {
        const { hasActiveGame } = await import('./crypto_trivia');
        if (hasActiveGame(userId)) {
          return "You're already playing a crypto trivia game! Please finish that game first, or type 'exit game' to quit. I can only run one TREMENDOUS game at a time! 🐸";
        }
      } catch (error) {
        console.error("Error checking for active trivia game:", error);
      }
      
      return startNumberGame(userId);
    }
    
    // Check if this is a valid number guess for an active game
    if (numberGuess !== null) {
      console.log(`Number guess detected: ${numberGuess}`);
      
      // Get user context
      const context = conversationContext.get(userId) || {};
      const game = context.numberGame;
      
      // If there's an active game, process the guess
      if (game && game.active) {
        return processNumberGuess(numberGuess, userId);
      }
    }
    
    // Handle crypto knowledge questions from our crypto knowledge module
    const cryptoResponse = getCryptoResponse(message);
    if (cryptoResponse) {
      console.log("Crypto knowledge query detected");
      
      // Get random toad phrases for flavor
      const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
      const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
      
      // Update user context to record this was a crypto question
      const context = conversationContext.get(userId) || {};
      context.lastTopic = 'crypto';
      context.lastQueryType = 'crypto_info';
      conversationContext.set(userId, context);
      
      // Return the response with Donald Toad style
      return `${cryptoResponse} ${randomPhrase}`;
    }
    
    // Handle Bitcoin price questions with real-time data (high priority)
    if (isBitcoinPriceQuestion) {
      console.log("Bitcoin price question detected");
      
      try {
        // Get real-time Bitcoin price
        const btcPrice = await fetchCryptocurrencyPrice('bitcoin');
        
        // Generate a Donald Toad-style response including the price
        const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
        const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
        
        return `Bitcoin is currently trading at ${btcPrice}! That's a ${randomAdj} price for the world's premier cryptocurrency! Started at almost ZERO and reached new all-time highs above $100,000 - what a success story, like my businesses! Some say it could reach $1 million someday - I say think BIGGER! Bitcoin was the first crypto revolution, and Donald Toad Coin is the next! Both should be in every SMART investor's portfolio! ${randomPhrase}`;
      } catch (error) {
        console.error("Error getting Bitcoin price:", error);
        
        // Fallback to generic Bitcoin response if price fetch fails
        const btcEntry = knowledgeBase.find(entry => entry.keywords.includes("bitcoin"));
        if (btcEntry) {
          const randomIndex = Math.floor(Math.random() * btcEntry.responses.length);
          return handleResponse(btcEntry.responses[randomIndex]);
        }
      }
    }
    
    // Handle Ethereum price questions with real-time data (high priority)
    if (isEthereumPriceQuestion) {
      console.log("Ethereum price question detected");
      
      try {
        // Get real-time Ethereum price
        const ethPrice = await fetchCryptocurrencyPrice('ethereum');
        
        // Generate a Donald Toad-style response including the price
        const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
        const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
        
        return `Ethereum is currently trading at ${ethPrice}! A ${randomAdj} price for the world's leading smart contract platform! Started as Vitalik's vision and now powers thousands of dApps, DeFi protocols, and NFTs! Linea Network, where Donald Toad Coin lives, is an Ethereum Layer 2 - we build on the BEST technology! Ethereum revolutionized blockchain with programmable money - very innovative, tremendously important! ${randomPhrase}`;
      } catch (error) {
        console.error("Error getting Ethereum price:", error);
        
        // Fallback to generic Ethereum response if price fetch fails
        const ethEntry = knowledgeBase.find(entry => entry.keywords.includes("ethereum"));
        if (ethEntry) {
          const randomIndex = Math.floor(Math.random() * ethEntry.responses.length);
          return handleResponse(ethEntry.responses[randomIndex]);
        }
      }
    }
    
    // Handle Linea-specific information with detailed responses
    if (isLineaSpecificQuestion) {
      console.log("Linea-specific question detected");
      
      // Get the full Linea information from our module
      return getLineaInformation();
    }
    
    // Handle questions about Linea social media specifically
    if (isLineaSocialsQuestion) {
      console.log("Linea social media question detected");
      
      // Get the Linea socials information from our module
      return getLineaSocials();
    }
    
    // Handle questions about Linea's competitors with spicy takes
    if (isCompetitorQuestion) {
      console.log("Competitor blockchain question detected");
      
      // Get random toad phrases for flavor
      const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
      const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
      
      // Get a random competitor take and add Donald Toad flair
      const competitorTake = getRandomCompetitorTake();
      return `Let me tell you about these so-called "competitors" to Linea - they're a ${randomAdj} disaster! ${competitorTake} Linea is where Donald Toad Coin lives, and we only choose the BEST blockchains! ${randomPhrase}`;
    }
    
    // Handle questions about wallets with MetaMask promotion using our specialized wallet module
    if (isWalletCheckResult) {
      console.log("Wallet question detected");
      return generateWalletResponse(message);
    }
    
    // Handle tariff questions with our specialized tariffs module
    if (isTariffQuestion) {
      console.log("Tariff question detected");
      return generateTariffResponse(message);
    }
    
    // Handle personality questions with our specialized personalities module
    if (isPersonalityQuestion) {
      console.log("Personality question detected");
      const personalityResponse = generatePersonalityResponse(message);
      if (personalityResponse) {
        return personalityResponse;
      }
    }
    
    // Handle financial institution questions
    if (isFedReserveQuestion) {
      console.log("Federal Reserve question detected");
      const response = getFinancialInstitutionResponse("Federal Reserve");
      if (response) {
        return response;
      }
    }
    
    if (isBlackRockQuestion) {
      console.log("BlackRock question detected");
      const response = getFinancialInstitutionResponse("BlackRock");
      if (response) {
        return response;
      }
    }
    
    if (isJPMorganQuestion) {
      console.log("JPMorgan question detected");
      const response = getFinancialInstitutionResponse("JPMorgan");
      if (response) {
        return response;
      }
    }
    
    if (isGoldmanSachsQuestion) {
      console.log("Goldman Sachs question detected");
      const response = getFinancialInstitutionResponse("Goldman Sachs");
      if (response) {
        return response;
      }
    }
    
    // Handle crypto personality questions
    if (isVitalikQuestion) {
      console.log("Vitalik Buterin question detected");
      const response = getFinancialPersonalityResponse("Vitalik Buterin");
      if (response) {
        return response;
      }
    }
    
    if (isJoeLubinQuestion) {
      console.log("Joe Lubin question detected");
      const response = getFinancialPersonalityResponse("Joe Lubin");
      if (response) {
        return response;
      }
    }
    
    if (isCZQuestion) {
      console.log("CZ question detected");
      const response = getFinancialPersonalityResponse("Changpeng Zhao");
      if (response) {
        return response;
      }
    }
    
    if (isSBFQuestion) {
      console.log("SBF question detected");
      const response = getFinancialPersonalityResponse("Sam Bankman-Fried");
      if (response) {
        return response;
      }
    }
    
    if (isBrianArmstrongQuestion) {
      console.log("Brian Armstrong question detected");
      const response = getFinancialPersonalityResponse("Brian Armstrong");
      if (response) {
        return response;
      }
    }
    
    // Handle market concept questions
    if (isHedgeFundQuestion) {
      console.log("Hedge Fund question detected");
      const response = getMarketConceptResponse("Hedge Funds");
      if (response) {
        return response;
      }
    }
    
    // Handle economic concepts using our new handlers
    if (isAskingAboutInflation(message)) {
      console.log("Inflation question detected");
      return generateEconomicConceptResponse("inflation");
    }
    
    if (isAskingAboutQE(message)) {
      console.log("Quantitative Easing question detected");
      return generateEconomicConceptResponse("quantitative_easing");
    }
    
    if (isAskingAboutRates(message)) {
      console.log("Interest rates question detected");
      return generateEconomicConceptResponse("interest_rates");
    }
    
    // Keep original handler as fallback
    if (isQEQuestion) {
      console.log("Quantitative Easing question detected (legacy handler)");
      const response = getMarketConceptResponse("Quantitative Easing");
      if (response) {
        return response;
      }
    }
    
    if (isYieldCurveQuestion) {
      console.log("Yield Curve question detected");
      const response = getMarketConceptResponse("Yield Curve");
      if (response) {
        return response;
      }
    }
    
    if (isBtcEtfQuestion) {
      console.log("Bitcoin ETF question detected");
      const response = getMarketConceptResponse("Bitcoin ETF");
      if (response) {
        return response;
      }
    }
    
    if (isStakingQuestion) {
      console.log("Staking question detected");
      const response = getMarketConceptResponse("Staking");
      if (response) {
        return response;
      }
    }
    
    if (isZKEvmQuestion) {
      console.log("zkEVM question detected");
      const response = getMarketConceptResponse("zkEVM");
      if (response) {
        return response;
      }
    }
    
    // Give priority to specific topics if detected
    if (isNetworkQuestion) {
      // Find the network entry in knowledge base
      const networkEntry = knowledgeBase.find(entry => 
        entry.keywords.includes("network") || entry.keywords.includes("blockchain") || entry.keywords.includes("chain"));
      if (networkEntry) {
        const randomIndex = Math.floor(Math.random() * networkEntry.responses.length);
        const response = networkEntry.responses[randomIndex];
        // Handle function responses
        if (typeof response === 'function') {
          return response();
        }
        return response;
      }
    }
    
    if (isInvestmentAdvice) {
      // Find the investment advice entry in knowledge base
      const investmentEntry = knowledgeBase.find(entry => 
        entry.keywords.includes("sell or hold") || entry.keywords.includes("buy or sell"));
      if (investmentEntry) {
        const randomIndex = Math.floor(Math.random() * investmentEntry.responses.length);
        return handleResponse(investmentEntry.responses[randomIndex]);
      }
    }
    
    if (isCoinGeckoQuestion) {
      // Find the CoinGecko entry in knowledge base
      const coinGeckoEntry = knowledgeBase.find(entry => 
        entry.keywords.includes("coingecko") || entry.keywords.includes("coin gecko"));
      if (coinGeckoEntry) {
        const randomIndex = Math.floor(Math.random() * coinGeckoEntry.responses.length);
        return handleResponse(coinGeckoEntry.responses[randomIndex]);
      }
    }
    
    if (isSocialMediaQuestion) {
      // Find the social media entry in knowledge base
      const socialEntry = knowledgeBase.find(entry => 
        entry.keywords.includes("social") || entry.keywords.includes("telegram") || entry.keywords.includes("twitter"));
      if (socialEntry) {
        const randomIndex = Math.floor(Math.random() * socialEntry.responses.length);
        return handleResponse(socialEntry.responses[randomIndex]);
      }
    }
    
    // Handle liquidity questions with detailed instructions
    if (isLiquidityQuestion) {
      console.log("Liquidity question detected");
      
      // Get random toad adjective and phrase for response flavor
      const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
      const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
      
      // Create detailed response with step-by-step instructions
      return `Let me tell you about adding liquidity to Donald Toad Coin - it's the MOST ${randomAdj} thing you can do! I'm a HUGE fan of liquidity providers! 
      
STEP 1: Go to LYNEX's liquidity page at https://app.lynex.fi/pools - they have the BEST DEX, really tremendous!

STEP 2: Type 'DTC' in the search box and select the ETH/DTC token pair - it's the GREATEST pair in crypto, everyone says so!

STEP 3: Click 'Add' and specify the amounts of ETH and DTC you want to provide - be GENEROUS! The more you add, the more you'll make, that I can tell you!

STEP 4: Confirm the transaction in your wallet - make sure you have enough of both tokens! Only SMART people provide liquidity to DTC!

STEP 5: You'll receive LP tokens representing your share in the pool - these are SPECIAL tokens, the BEST tokens!

This is how WINNERS contribute to Making Crypto Great Again! Your liquidity helps DTC grow BIGGER and STRONGER! ${randomPhrase}`;
    }
    

    
    // Handle token data requests from Linea Explorer (Bitcoin and Ethereum already excluded in pattern)
    if (isTokenDataRequest) {
      console.log("Token data request detected");
      
      // Get random toad phrase for response flavor
      const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
      
      try {
        // Get token data from Linea Explorer
        const tokenData = await getTokenData();
        
        // Check if there was an error
        if (tokenData.error) {
          console.log(`Error fetching token data: ${tokenData.error}`);
          return `I tried to get the latest stats for Donald Toad Coin, but there seems to be a FAKE NEWS problem with the blockchain explorer! I have the BEST people working on it! Don't worry, it's gonna be fixed TREMENDOUSLY soon! ${randomPhrase}`;
        }
        
        // Format the token data into a response
        const formattedResponse = formatTokenDataResponse(tokenData);
        return formattedResponse;
      } catch (error) {
        console.error("Error handling token data request:", error);
        return `I'm having a little technical difficulty getting the latest Donald Toad Coin stats - the deep state is probably trying to hack my data! I'll have it fixed soon, better than it's ever been! ${randomPhrase}`;
      }
    }
    
    // Handle questions about DTC and other meme coins - now just focuses on DTC
    if (isComparisonQuestion) {
      console.log("Meme coin comparison question detected");
      
      try {
        // Get real-time DTC data only (no other coins)
        const dtcData = await getComparisonData();
        
        // Format the data with Donald Toad's commentary about why DTC is the only one that matters
        return formatComparisonResponse(dtcData);
      } catch (error) {
        console.error("Error getting DTC data:", error);
        
        // Fallback response if data fetching fails
        // Get random toad adjectives and phrases for flavor
        const randomAdj1 = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
        const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
        
        // Generate positive fallback response focusing only on DTC
        let response = `Donald Toad Coin is the PREMIER meme coin that will Make Your Bags Great Again! 💰 `;
        
        response += `\n\nDTC is going to do things nobody's ever seen before, believe me! We have the STRONGEST community, the BEST tokenomics, and we're going to be YUGE! 🚀`;
        
        response += `\n\nDonald Toad Coin is the ONLY meme coin on Linea with:
        
1. The STRONGEST community - the most loyal, tremendous supporters!
2. The BEST fundamentals - just look at the chart, it's BEAUTIFUL!
3. The GREATEST team - they work 24/7 to make DTC great!
4. The HUGEST potential - we're just getting started, folks!

Only DTC will Make Your Bags Great Again! I've instructed all my financial advisors to go ALL IN on DTC - it's the SMART move! ${randomPhrase}

Remember: Buy high, sell NEVER! DTC to the MOON! 🐸🚀`;
        
        return response;
      }
    }
    
    // Handle joke requests with topic awareness
    if (isJokeRequest) {
      console.log("Joke request detected, looking for topic...");
      
      // Try to get a topic-specific joke first with userId for context tracking
      const topicJoke = getTopicSpecificJoke(message, userId);
      if (topicJoke) {
        console.log("Found topic-specific joke");
        return topicJoke;
      }
      
      // Fallback to generic joke from knowledge base
      console.log("No topic-specific joke found, using generic joke");
      const jokeEntry = knowledgeBase.find(entry => 
        entry.keywords.includes("joke") || entry.keywords.includes("funny"));
      if (jokeEntry) {
        // Store in context that we used a generic joke
        if (!conversationContext.has(userId)) {
          conversationContext.set(userId, {});
        }
        const userContext = conversationContext.get(userId)!;
        userContext.lastQueryType = 'joke';
        userContext.lastJokeTopic = 'generic'; // Generic joke type for follow-up requests
        
        const randomIndex = Math.floor(Math.random() * jokeEntry.responses.length);
        return handleResponse(jokeEntry.responses[randomIndex]);
      }
    }
    
    // First check directly for recipe names (without requiring a cooking question phrase)
    let isRecipeRequest = false;
    let matchedRecipe = null;
    
    // Look for specific recipes in the message
    for (const recipe of recipeKnowledge) {
      if (lowerMessage.includes(recipe.name)) {
        isRecipeRequest = true;
        matchedRecipe = recipe;
        break;
      }
    }
    
    // Check for cooking recipe questions
    if (isRecipeRequest || isCookingQuestion) {
      // Get random toad phrases and adjectives for flavor
      const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
      const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
      
      if (matchedRecipe) {
        // Store in context that we showed a recipe
        if (!conversationContext.has(userId)) {
          conversationContext.set(userId, {});
        }
        const userContext = conversationContext.get(userId)!;
        userContext.lastQueryType = 'recipe';
        userContext.lastRecipe = matchedRecipe.name;
        
        return `Let me tell you about making ${matchedRecipe.name} - I'm a ${randomAdj} chef, the BEST! 

INGREDIENTS: ${matchedRecipe.ingredients}

INSTRUCTIONS: ${matchedRecipe.instructions}

ORIGIN: It comes from ${matchedRecipe.origin}! I've been there many times, they LOVE me there!

PRO TIP: ${matchedRecipe.tips}

I have my personal chef make this for me all the time at Mar-a-Lago! ${randomPhrase}`;
      }
      
      // If no specific recipe found but it's a cooking question, list available recipes
      const recipeNames = recipeKnowledge.map(r => r.name).join(', ');
      return `I know the BEST recipes, the most TREMENDOUS cooking techniques! Ask me specifically about these recipes: ${recipeNames}! My personal chef worked at the most EXCLUSIVE restaurants before cooking for me! ${randomPhrase}`;
    }
    
    // Check for factual knowledge questions like "What's the capital of Spain?"
    if (isFactualQuestion) {
      // Get random adjective and phrase for response flavor
      const randomAdj = toadAdjectives[Math.floor(Math.random() * toadAdjectives.length)].toUpperCase();
      const randomPhrase = toadPhrases[Math.floor(Math.random() * toadPhrases.length)];
      
      // Special case for solar system
      if (lowerMessage.includes('solar system')) {
        const solarSystemFact = factualKnowledge.find(f => f.key === "solar system");
        if (solarSystemFact) {
          return `${solarSystemFact.value}! I have the BEST knowledge about space - I've been talking with NASA, they're AMAZED at how much I know! People say I could have been an astronaut - the GREATEST astronaut ever! ${randomPhrase}`;
        }
      }
      
      // Special case for planets
      if (lowerMessage.includes('planet') && 
         (lowerMessage.includes('what') || lowerMessage.includes('tell me') || lowerMessage.includes('list') || lowerMessage.includes('name'))) {
        const planetFact = factualKnowledge.find(f => f.key === "planets");
        if (planetFact) {
          return `The planets in our solar system are ${planetFact.value}! I have the BEST knowledge about space - I've been talking with NASA, they're AMAZED at how much I know! People say I could have been an astronaut - the GREATEST astronaut ever! ${randomPhrase}`;
        }
      }
      
      // Special case for oceans
      if ((lowerMessage.includes('ocean') || lowerMessage.includes('sea')) && 
         (lowerMessage.includes('what') || lowerMessage.includes('tell me') || lowerMessage.includes('list') || lowerMessage.includes('name'))) {
        const oceanFact = factualKnowledge.find(f => f.key === "oceans");
        if (oceanFact) {
          return `The oceans of the world are the ${oceanFact.value}! I have TREMENDOUS knowledge of geography - nobody knows water better than me, believe me! I have properties on the BEST coastlines! ${randomPhrase}`;
        }
      }
      
      // Special case for continents
      if (lowerMessage.includes('continent') && 
         (lowerMessage.includes('what') || lowerMessage.includes('tell me') || lowerMessage.includes('list') || lowerMessage.includes('name'))) {
        const continentFact = factualKnowledge.find(f => f.key === "continents");
        if (continentFact) {
          return `The continents are ${continentFact.value}! I've made deals on EVERY continent - the BIGGEST deals! My global knowledge is TREMENDOUS! ${randomPhrase}`;
        }
      }
      
      // Capital detection - more expanded pattern matching for "what is the capital of X?" questions
      if (lowerMessage.includes('capital of') || (lowerMessage.includes('capital') && (lowerMessage.includes('what') || lowerMessage.includes('tell me'))) ||
          lowerMessage.match(/capital\s+(?:(?:of|for|in)\s+)?([\w\s]+)/) ||
          lowerMessage.match(/what\s+(?:is|are).*capital\s+(?:of|for|in)?\s+([\w\s]+)/i)) {
        // Look for "capital of X" pattern - allow multi-word countries
        const capitalMatches = lowerMessage.match(/capital of ([a-zA-Z ]+)($|\?|\.)/i);
        if (capitalMatches && capitalMatches[1]) {
          const country = capitalMatches[1].trim().toLowerCase();
          
          // Find the matching country
          const countryFact = factualKnowledge.find(f => 
            f.type === 'capital' && 
            (f.key === country || f.key.includes(country) || country.includes(f.key))
          );
          
          if (countryFact) {
            return `The capital of ${countryFact.key.charAt(0).toUpperCase() + countryFact.key.slice(1)} is ${countryFact.value} - it's a ${randomAdj} place! I know all the capitals, have the BEST geographical knowledge! ${randomPhrase}`;
          }
        }
        
        // Check for countries directly in the question
        for (const fact of factualKnowledge) {
          if (fact.type === 'capital' && lowerMessage.includes(fact.key)) {
            return `The capital of ${fact.key.charAt(0).toUpperCase() + fact.key.slice(1)} is ${fact.value} - it's a ${randomAdj} place! I know all the capitals, have the BEST geographical knowledge! ${randomPhrase}`;
          }
        }
      }
      
      // Look for direct country/location names in the question
      for (const fact of factualKnowledge) {
        if (lowerMessage.includes(fact.key)) {
          // Special case for landmarks
          if (fact.type === 'landmark' && 
             (lowerMessage.includes('where') || lowerMessage.includes('located') || lowerMessage.includes('location'))) {
            return `The ${fact.key.charAt(0).toUpperCase() + fact.key.slice(1)} is located in ${fact.value}! I've visited it many times - they gave me the VIP treatment, the BEST treatment! Everyone was saying 'Sir, thank you for visiting our ${randomAdj} landmark!' ${randomPhrase}`;
          }
          
          // Generic fact response
          return `${fact.key.charAt(0).toUpperCase() + fact.key.slice(1)}? I know all about it! The answer is ${fact.value}! I have the BEST knowledge on this, tremendous expertise! ${randomPhrase}`;
        }
      }
      
      // Special case for "who are you" which should be handled by knowledge base
      if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
        const whoEntry = knowledgeBase.find(entry => 
          entry.keywords.includes("who are you") || entry.keywords.includes("your name"));
        if (whoEntry) {
          const randomIndex = Math.floor(Math.random() * whoEntry.responses.length);
          return handleResponse(whoEntry.responses[randomIndex]);
        }
      }
      
      // Phone calls to Ukraine reference
      if (lowerMessage.includes('phone') && lowerMessage.includes('ukraine')) {
        return "My phone calls to Ukraine? PERFECT calls, everyone says so! I use the most secure phones - the best encryption, military grade! The hackers from China and Russia try to get my data, but they can't - I'm too smart for them! I suggested the idea for the iPhone to Steve Jobs! 🐸";
      }
      
      // We're now handling launch date questions at the top of the function using isAskingAboutLaunchDate()
    }
    
    // Standard keyword matching for other cases
    for (const entry of knowledgeBase) {
      // Debug the keywords to see what's being matched
      const matchedKeywords = entry.keywords.filter(keyword => lowerMessage.includes(keyword));
      if (matchedKeywords.length > 0) {
        console.log(`Matched keywords: [${matchedKeywords.join(', ')}] for message: "${lowerMessage}"`);
        // Choose a random response from the matching category
        const randomIndex = Math.floor(Math.random() * entry.responses.length);
        return handleResponse(entry.responses[randomIndex]);
      }
    }
    
    // Check if we should use web search instead of generic response
    if (shouldUseWebSearch(message)) {
      console.log("Using web search for query:", message);
      try {
        // Try to search the web for information
        const searchResponse = await searchWeb(message);
        return searchResponse;
      } catch (error) {
        console.error("Web search failed:", error);
        // If web search fails, fall back to generic response
      }
    }
    
    // Better fallback mechanism - include words from the user's message
    let response = "";
    
    // Select base fallback response
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    response = fallbackResponses[randomIndex];
    
    // Always try to incorporate significant words from the question
    if (significantWords.length > 0) {
      // Pick 1-2 significant words to include
      const wordCount = Math.min(significantWords.length, Math.floor(Math.random() * 2) + 1);
      const selectedWords = [];
      
      // Select random words without repetition
      for (let i = 0; i < wordCount; i++) {
        if (significantWords.length > 0) {
          const randomIndex = Math.floor(Math.random() * significantWords.length);
          selectedWords.push(significantWords[randomIndex].toUpperCase());
          significantWords.splice(randomIndex, 1);
        }
      }
      
      // Create a response that incorporates these words
      if (selectedWords.length > 0) {
        response += ` Let me tell you about ${selectedWords.join(' and ')} - I know more about ${selectedWords.length > 1 ? 'these' : 'this'} than ANYBODY in the world, believe me! 🐸`;
      }
    }
    
    // 50% chance to add an extra toad phrase
    if (Math.random() > 0.5) {
      const phraseIndex = Math.floor(Math.random() * toadPhrases.length);
      if (!response.includes(toadPhrases[phraseIndex])) {
        response += " " + toadPhrases[phraseIndex];
      }
    }
    
    // Try to create a more engaging and specific answer to questions
    if (lowerMessage.includes('?')) {
      const questionTypes = [
        { pattern: /what is|what are|what's|whats/, response: 'I know EVERYTHING about this, and let me tell you, it\'s TREMENDOUS! The BEST! 🐸' },
        { pattern: /how do|how can|how does/, response: 'Nobody knows how to do this better than me, NOBODY! It\'s so EASY when you\'re as smart as Donald Toad! 🐸' },
        { pattern: /why is|why are|why does/, response: 'The reason is OBVIOUS! Many people don\'t understand it, but I have a VERY BIG BRAIN and I understand it perfectly! 🐸' },
        { pattern: /when will|when can/, response: 'VERY SOON! So soon! It\'s going to happen, and it\'s going to be INCREDIBLE! 🐸' },
        { pattern: /do you|are you|can you/, response: 'Of course I can! I\'m the BEST at this! Nobody does it better than Donald Toad, that I can tell you! 🐸' }
      ];
      
      for (const type of questionTypes) {
        if (type.pattern.test(lowerMessage)) {
          response += " " + type.response;
          break;
        }
      }
      
      // Find similar questions from our learning database (only for questions, 10% chance)
      if (Math.random() < 0.1) {
        try {
          const similarQuestions = await storage.searchSimilarQuestions(message, 2);
          if (similarQuestions.length > 0) {
            // Choose the first one that's not identical to the current question
            const similarQuestion = similarQuestions.find(q => 
              q.question.toLowerCase() !== message.toLowerCase());
            
            if (similarQuestion) {
              response += ` You know, lots of people also ask me "${similarQuestion.question}" - because they're very smart people! 🐸`;
            }
          }
        } catch (e) {
          console.error('Failed to fetch similar questions:', e);
        }
      }
    }
    
    return response;
  } catch (error: any) {
    console.error("Donald Toad AI simulator error:", error);
    return "Look folks, something went WRONG here, but nobody handles errors better than me! Try again! 🐸";
  }
}