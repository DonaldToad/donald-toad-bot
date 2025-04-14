import axios from 'axios';
import { getTokenData, formatTokenDataResponse } from './linea-explorer';

// Cache for crypto prices to avoid excessive API calls
interface PriceCache {
  [symbol: string]: {
    price: string;
    timestamp: number;
  };
}

// Price cache with 5-minute expiration
const priceCache: PriceCache = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Get the current price of a cryptocurrency
 * 
 * @param symbol The symbol/id of the cryptocurrency
 * @returns The current price in USD
 */
export async function getCryptoPrice(symbol: string): Promise<string> {
  const normalizedSymbol = symbol.toLowerCase();
  
  // Convert common symbols to CoinGecko IDs
  const symbolMap: { [key: string]: string } = {
    'btc': 'bitcoin',
    'eth': 'ethereum',
    'dtc': 'donald-toad-coin'
  };
  
  const coinId = symbolMap[normalizedSymbol] || normalizedSymbol;
  
  // Check cache first
  const now = Date.now();
  if (priceCache[coinId] && now - priceCache[coinId].timestamp < CACHE_EXPIRY) {
    console.log(`Using cached price for ${coinId}: ${priceCache[coinId].price}`);
    return priceCache[coinId].price;
  }
  
  try {
    // Use CoinGecko API to get price data
    const apiKey = process.env.COINGECKO_API_KEY;
    
    // Fixing API URL to use latest CoinGecko API v3 format
    console.log(`Fetching price data for ${coinId} from CoinGecko...`);
    
    // Use free API endpoint first as a fallback with 24h change included
    let url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`;
    
    // Handle special case for DTC which isn't on CoinGecko
    if (coinId === 'donald-toad-coin') {
      console.log("DTC not available on CoinGecko, using fixed value");
      return '1.337';
    }
    
    const response = await axios.get(url);
    
    if (response.data && response.data[coinId]) {
      const priceUsd = response.data[coinId].usd;
      const change24h = response.data[coinId].usd_24h_change;
      
      // Format the price with appropriate precision
      let formattedPrice = priceUsd.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      // Add 24h change if available
      if (change24h !== undefined) {
        const changePrefix = change24h >= 0 ? '+' : '';
        formattedPrice += ` (${changePrefix}${change24h.toFixed(2)}% 24h)`;
      }
      
      // Update cache
      priceCache[coinId] = {
        price: formattedPrice,
        timestamp: now
      };
      
      console.log(`Got price for ${coinId}: $${formattedPrice}`);
      return formattedPrice;
    } else {
      throw new Error(`No price data found for ${coinId}`);
    }
  } catch (error) {
    console.error(`Error fetching price for ${coinId}:`, error);
    
    // Try pro API if free API fails
    try {
      const apiKey = process.env.COINGECKO_API_KEY;
      if (apiKey) {
        console.log(`Retrying with Pro API key for ${coinId}...`);
        const proUrl = `https://pro-api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&x_cg_pro_api_key=${apiKey}`;
        
        const proResponse = await axios.get(proUrl);
        
        if (proResponse.data && proResponse.data[coinId]) {
          const priceUsd = proResponse.data[coinId].usd;
          const change24h = proResponse.data[coinId].usd_24h_change;
          
          // Format the price with appropriate precision
          let formattedPrice = priceUsd.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
          
          // Add 24h change if available
          if (change24h !== undefined) {
            const changePrefix = change24h >= 0 ? '+' : '';
            formattedPrice += ` (${changePrefix}${change24h.toFixed(2)}% 24h)`;
          }
          
          // Update cache
          priceCache[coinId] = {
            price: formattedPrice,
            timestamp: now
          };
          
          console.log(`Got price with Pro API for ${coinId}: $${formattedPrice}`);
          return formattedPrice;
        }
      }
    } catch (proError) {
      console.error(`Pro API also failed for ${coinId}:`, proError);
    }
    
    // Fallback values if all API attempts fail
    if (coinId === 'bitcoin') return '69,420';
    if (coinId === 'ethereum') return '4,200';
    if (coinId === 'donald-toad-coin') return '1.337';
    
    return 'Price data unavailable';
  }
}

/**
 * Format a cryptocurrency price response
 * 
 * @param symbol The cryptocurrency symbol
 * @param price The price in USD
 * @returns A formatted response about the cryptocurrency price
 */
export function formatPriceResponse(symbol: string, price: string): string {
  const normalizedSymbol = symbol.toLowerCase();
  
  if (normalizedSymbol === 'btc' || normalizedSymbol === 'bitcoin') {
    return `Bitcoin is at $${price}. The king of the swamp! 👑🐸 Some say it's digital gold, but Donald Toad Coin will be digital PLATINUM! Believe me!`;
  }
  
  if (normalizedSymbol === 'eth' || normalizedSymbol === 'ethereum') {
    return `Ethereum is at $${price}. Vitalik's frog palace. 🐸💎 Good tech, but gas fees are TERRIBLE! That's why Linea is better!`;
  }
  
  if (normalizedSymbol === 'dtc' || normalizedSymbol === 'donald-toad-coin') {
    return `Donald Toad Coin (DTC) is at $${price}. Only the STRONG croak here. 🐸💰 THE BEST coin, maybe ever! Going to YUGE prices soon!`;
  }
  
  return `${symbol.toUpperCase()} is at $${price}. Good coin, but not as good as Donald Toad Coin! 🐸`;
}

/**
 * Detect if a message is asking about cryptocurrency prices
 * 
 * @param message The message to check
 * @returns The symbol of the cryptocurrency or null if not a price query
 */
export function detectPriceQuery(message: string): string | null {
  const normalizedMessage = message.toLowerCase();
  
  // Common price query patterns
  const pricePatterns = [
    /bitcoin price/i,
    /price of bitcoin/i,
    /btc price/i,
    /ethereum price/i,
    /price of ethereum/i,
    /eth price/i,
    /dtc price/i,
    /donald toad coin price/i,
    /price of dtc/i
  ];
  
  // Check for direct matches
  for (const pattern of pricePatterns) {
    if (pattern.test(normalizedMessage)) {
      // Extract the symbol
      if (normalizedMessage.includes('bitcoin') || normalizedMessage.includes('btc')) {
        return 'btc';
      }
      if (normalizedMessage.includes('ethereum') || normalizedMessage.includes('eth')) {
        return 'eth';
      }
      if (normalizedMessage.includes('dtc') || normalizedMessage.includes('donald toad coin')) {
        return 'dtc';
      }
    }
  }
  
  // Check for simpler mentions
  if (normalizedMessage === 'btc' || normalizedMessage === 'bitcoin') {
    return 'btc';
  }
  if (normalizedMessage === 'eth' || normalizedMessage === 'ethereum') {
    return 'eth';
  }
  if (normalizedMessage === 'dtc' || normalizedMessage === 'donald toad coin') {
    return 'dtc';
  }
  
  return null;
}

/**
 * Process a cryptocurrency price query
 * 
 * @param message The message to process
 * @returns A formatted response about the cryptocurrency price or null if not a price query
 */
export async function processPriceQuery(message: string): Promise<string | null> {
  const symbol = detectPriceQuery(message);
  
  if (symbol) {
    // Special handling for DTC to use the detailed stats format
    if (symbol === 'dtc') {
      console.log("Token data request detected");
      try {
        // Get the detailed DTC token data from Linea Explorer
        const tokenData = await getTokenData();
        // Format it using the existing formatter
        return formatTokenDataResponse(tokenData);
      } catch (error) {
        console.error("Error getting DTC token data:", error);
        // Fallback to simple price response
        const price = await getCryptoPrice(symbol);
        return formatPriceResponse(symbol, price);
      }
    } else {
      // For other cryptocurrencies, use the standard price response
      const price = await getCryptoPrice(symbol);
      return formatPriceResponse(symbol, price);
    }
  }
  
  return null;
}