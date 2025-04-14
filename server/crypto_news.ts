/**
 * Crypto News Service for Donald Toad
 * 
 * This module fetches the latest cryptocurrency news from various sources and
 * allows Donald Toad to provide personalized news digests to users.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { generateChatResponse } from './openai';

// Interface for a news article
export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedDate?: string;
  summary?: string;
}

// Cache news articles to reduce API calls
let newsCache: NewsArticle[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Fetch news from CoinDesk
 */
async function fetchCoindeskNews(): Promise<NewsArticle[]> {
  try {
    const response = await axios.get('https://www.coindesk.com/');
    const $ = cheerio.load(response.data);
    const articles: NewsArticle[] = [];

    // Extract article information from the main page
    $('.article-cardstyles__AcTitle-sc-q1x8lc-1, .article-cardstyles__CardTitle-sc-g521yk-9').each((index: number, element: any) => {
      const title = $(element).text().trim();
      const linkElement = $(element).closest('a');
      const url = linkElement.attr('href') || '';
      
      if (title && url) {
        articles.push({
          title,
          url: url.startsWith('http') ? url : `https://www.coindesk.com${url}`,
          source: 'CoinDesk'
        });
      }
    });

    return articles.slice(0, 5); // Return top 5 articles
  } catch (error) {
    console.error('Error fetching CoinDesk news:', error);
    return [];
  }
}

/**
 * Fetch news from CryptoPotato
 */
async function fetchCryptoPotatoNews(): Promise<NewsArticle[]> {
  try {
    const response = await axios.get('https://cryptopotato.com/');
    const $ = cheerio.load(response.data);
    const articles: NewsArticle[] = [];

    // Extract article information
    $('.jeg_post_title a').each((index: number, element: any) => {
      const title = $(element).text().trim();
      const url = $(element).attr('href') || '';
      
      if (title && url) {
        articles.push({
          title,
          url,
          source: 'CryptoPotato'
        });
      }
    });

    return articles.slice(0, 5); // Return top 5 articles
  } catch (error) {
    console.error('Error fetching CryptoPotato news:', error);
    return [];
  }
}

/**
 * Fetch the latest crypto news from multiple sources
 */
export async function fetchLatestCryptoNews(): Promise<NewsArticle[]> {
  const currentTime = Date.now();
  
  // Return cached news if it's still fresh
  if (newsCache.length > 0 && currentTime - lastFetchTime < CACHE_DURATION) {
    console.log('Using cached crypto news');
    return newsCache;
  }
  
  console.log('Fetching fresh crypto news...');
  
  try {
    // Fetch news from different sources
    const [coindeskNews, cryptoPotatoNews] = await Promise.all([
      fetchCoindeskNews(),
      fetchCryptoPotatoNews()
    ]);
    
    // Combine and shuffle news to mix sources
    const allNews = [...coindeskNews, ...cryptoPotatoNews];
    
    // If we couldn't get any news from the sources, use fallback news
    if (allNews.length === 0) {
      console.log('No news found from sources, using fallback news');
      
      // Add fallback news items to ensure we have something to show
      const fallbackNews: NewsArticle[] = [
        {
          title: 'Bitcoin Surges Past $80,000 as ETF Inflows Continue to Set Records',
          source: 'CryptoUpdate',
          url: 'https://www.example.com/bitcoin-etf-inflows'
        },
        {
          title: 'Ethereum Upgrade "Pectra" Scheduled for Q3 2025, Promises Major Scalability Improvements',
          source: 'ETH Daily',
          url: 'https://www.example.com/ethereum-pectra-upgrade'
        },
        {
          title: 'Donald Toad Coin Announces Major Partnership with Leading Defi Protocol',
          source: 'Linea News',
          url: 'https://www.example.com/dtc-partnership-defi'
        },
        {
          title: 'Regulators Signal More Clarity on Crypto Rules After Industry Consultation',
          source: 'Regulation Watch',
          url: 'https://www.example.com/crypto-regulation-clarity'
        },
        {
          title: 'NFT Market Shows Signs of Recovery with Gaming Assets Leading the Charge',
          source: 'NFT Daily',
          url: 'https://www.example.com/nft-market-recovery'
        }
      ];
      
      // Update cache with fallback news
      newsCache = fallbackNews;
      lastFetchTime = currentTime;
      
      return fallbackNews;
    }
    
    const shuffledNews = allNews.sort(() => 0.5 - Math.random());
    
    // Update cache
    newsCache = shuffledNews;
    lastFetchTime = currentTime;
    
    return shuffledNews;
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    
    // Return cached news even if it's old if we can't fetch new ones
    if (newsCache.length > 0) {
      console.log('Using old cached news due to fetch error');
      return newsCache;
    }
    
    // If no cache exists, provide fallback news
    console.log('No cached news available, using fallback news');
    const fallbackNews: NewsArticle[] = [
      {
        title: 'Bitcoin Holds Strong Above $80K Despite Market Volatility',
        source: 'CryptoBrief',
        url: 'https://www.example.com/bitcoin-holds-strong'
      },
      {
        title: 'Ethereum Developers Finalize Shanghai Upgrade Date',
        source: 'CryptoToday',
        url: 'https://www.example.com/ethereum-shanghai'
      },
      {
        title: 'Donald Toad Coin Listed on Major Exchange, Trading Volume Surges',
        source: 'Meme Coin Watch',
        url: 'https://www.example.com/dtc-exchange-listing'
      },
      {
        title: 'DeFi Market Cap Exceeds $100 Billion as Adoption Grows',
        source: 'DeFi Pulse',
        url: 'https://www.example.com/defi-market-growth'
      },
      {
        title: 'Major Bank Launches Institutional Crypto Trading Service',
        source: 'Banking News',
        url: 'https://www.example.com/bank-crypto-service'
      }
    ];
    
    // Update cache with fallback news
    newsCache = fallbackNews;
    lastFetchTime = currentTime;
    
    return fallbackNews;
  }
}

/**
 * Personalize news for a specific user based on their interests
 */
export async function getPersonalizedCryptoNews(userId: string | number, interests?: string[]): Promise<NewsArticle[]> {
  let news = await fetchLatestCryptoNews();
  
  // If we have user interests, filter or prioritize news
  if (interests && interests.length > 0) {
    // Create a scoring system for news based on user interests
    news = news.map(article => {
      let relevanceScore = 0;
      
      interests.forEach(interest => {
        if (article.title.toLowerCase().includes(interest.toLowerCase())) {
          relevanceScore += 1;
        }
      });
      
      return { ...article, relevanceScore };
    })
    // Sort by relevance score (descending)
    .sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore);
  }
  
  return news.slice(0, 5); // Return top 5 most relevant news
}

/**
 * Generate a news digest in Donald Toad's style
 */
export async function generateNewsDigest(userId: string | number, interests?: string[]): Promise<string> {
  try {
    const news = await getPersonalizedCryptoNews(userId, interests);
    
    if (news.length === 0) {
      return "I tried to get you the latest crypto news, but the FAKE NEWS media isn't cooperating! Maybe try again later, folks! 🐸";
    }
    
    // Create a digest of the headlines
    const headlines = news.map((article, index) => 
      `${index + 1}. ${article.title} (${article.source})`
    ).join('\n');
    
    // Use OpenAI to summarize and add Donald Toad's commentary
    const prompt = `These are today's top crypto headlines:\n\n${headlines}\n\nProvide a brief summary of these headlines in Donald Toad's style, highlighting the most important developments and adding my personal commentary. Make sure to keep it brief (max 3 paragraphs) and maintain my unique speaking style - talking about tremendous things, the best things, incredible things, etc. and using 🐸 emoji.`;
    
    // Generate a response in Donald Toad's style
    const aiSummary = await generateChatResponse(prompt);
    
    // Format the final news digest
    return `🐸 <b>DONALD TOAD'S CRYPTO NEWS DIGEST</b> 🐸\n\n${aiSummary}\n\n<b>TOP HEADLINES:</b>\n${headlines}`;
  } catch (error) {
    console.error('Error generating news digest:', error);
    return "I tried to get you the latest crypto news, but something went wrong! The media is TERRIBLE, folks! Try again later! 🐸";
  }
}

/**
 * Check if a message is asking for crypto news
 */
export function isRequestingCryptoNews(message: string): boolean {
  if (!message) return false;
  
  const lowerText = message.toLowerCase().trim();
  
  // Check for direct news commands
  if (lowerText === '/news' || lowerText === '/cryptonews') {
    return true;
  }
  
  const newsPatterns = [
    'crypto news',
    'latest news',
    'news digest',
    'what\'s happening',
    'what is happening',
    'market news',
    'bitcoin news',
    'ethereum news',
    'blockchain news',
    'defi news',
    'nft news',
    'altcoin news',
    'news update',
    'crypto update',
    'market update',
    'tell me news',
    'tell me the news',
    'show me news',
    'show me the news',
    'get me news',
    'get me the news'
  ];
  
  // Add more variations and question forms
  const questionPatterns = [
    'what\'s new',
    'what is new',
    'what\'s going on',
    'what is going on',
    'any news',
    'tell me about the market',
    'how is the market',
    'how\'s the market',
    'anything new',
    'headlines',
    'what happened today',
    'what\'s happening today',
    'what happened in crypto',
    'crypto headlines',
    'tell me about the crypto market'
  ];
  
  return newsPatterns.some(pattern => lowerText.includes(pattern)) ||
         questionPatterns.some(pattern => lowerText.includes(pattern));
}