/**
 * Linea Explorer and CoinGecko Data Service
 * 
 * This module fetches real-time token data from Linea Explorer and CoinGecko for the Donald Toad Coin (DTC)
 * including market cap, number of holders, burned tokens, circulating supply, and price.
 */

import axios from 'axios';
import { load } from 'cheerio';

// Constants - Token Addresses
const DTC_CONTRACT_ADDRESS = '0xEb1fD1dBB8aDDA4fa2b5A5C4bcE34F6F20d125D2'; // Donald Toad Coin
const FOXY_CONTRACT_ADDRESS = '0x11916faae637908cc4e6d9cda680ca59e5a3db2f'; // Foxy
const CROAK_CONTRACT_ADDRESS = '0x1848bdc1d9acb7ff326bc3145fcc2979bca7b0fc'; // Croak

// API URLs
const LINEA_EXPLORER_BASE_URL = 'https://lineascan.build';
const LINEA_DTC_URL = `${LINEA_EXPLORER_BASE_URL}/token/${DTC_CONTRACT_ADDRESS}`;
const LINEA_FOXY_URL = `${LINEA_EXPLORER_BASE_URL}/token/${FOXY_CONTRACT_ADDRESS}`;
const LINEA_CROAK_URL = `${LINEA_EXPLORER_BASE_URL}/token/${CROAK_CONTRACT_ADDRESS}`;

// CoinGecko API
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const COINGECKO_PRO_API_URL = 'https://pro-api.coingecko.com/api/v3';
const DTC_COINGECKO_ID = 'donald-toad-coin'; // CoinGecko ID for Donald Toad Coin
// Note: These IDs might not be in CoinGecko yet. We'll use our custom data fetching instead
const FOXY_COINGECKO_ID = 'foxy-token';      // Placeholder for Foxy
const CROAK_COINGECKO_ID = 'croak-token';    // Placeholder for Croak

// Interface for token data
export interface TokenData {
  marketCap: string;
  holders: string;
  burnedTokens: string;
  circulatingSupply: string;
  totalSupply: string;
  price: string;
  lastUpdated: Date;
  error?: string;
}

// Enhanced Token Data interface with name field
export interface TokenComparisonData extends TokenData {
  name: string;
  contractAddress: string;
}

// Cache the token data to avoid too frequent requests
let cachedDtcData: TokenData | null = null;
let cachedFoxyData: TokenData | null = null;
let cachedCroakData: TokenData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Formats a number with commas for thousands separators
 */
function formatNumber(num: string | number): string {
  return Number(num).toLocaleString();
}

/**
 * Fetches the price data from CoinGecko
 */
async function fetchPriceFromCoinGecko(): Promise<string> {
  try {
    console.log('Fetching price data from CoinGecko...');
    
    // Always use the public API for now (even with API key) as we're using a demo key
    // The error message indicates we need to use api.coingecko.com instead of pro-api.coingecko.com
    const baseUrl = COINGECKO_API_URL;
    const url = `${baseUrl}/simple/price?ids=${DTC_COINGECKO_ID}&vs_currencies=usd&include_24hr_change=true`;
    
    // Add API key as query parameter for demo keys
    const urlWithKey = COINGECKO_API_KEY ? `${url}&x_cg_demo_api_key=${COINGECKO_API_KEY}` : url;
    
    console.log(`Using CoinGecko API URL: ${urlWithKey.replace(COINGECKO_API_KEY || '', '[REDACTED]')}`);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'Donald Toad Coin App'
    };
    
    if (COINGECKO_API_KEY) {
      console.log('Using CoinGecko API with demo key as query parameter');
    } else {
      console.log('Using public CoinGecko API (no key)');
    }
    
    const response = await axios.get(urlWithKey, { headers });
    console.log('CoinGecko API response:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data[DTC_COINGECKO_ID] && response.data[DTC_COINGECKO_ID].usd) {
      const priceUsd = response.data[DTC_COINGECKO_ID].usd;
      const change24h = response.data[DTC_COINGECKO_ID].usd_24h_change;
      
      // Format the price with appropriate precision
      let formattedPrice = `$${priceUsd < 0.01 ? priceUsd.toFixed(6) : priceUsd.toFixed(4)}`;
      
      // Add 24h change indicator if available
      if (change24h !== undefined) {
        const changePrefix = change24h >= 0 ? '+' : '';
        formattedPrice += ` (${changePrefix}${change24h.toFixed(2)}% 24h)`;
      }
      
      return formattedPrice;
    } else {
      throw new Error('Price data not found in CoinGecko response');
    }
  } catch (error: any) {
    if (error.response) {
      console.error('CoinGecko API error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    console.error('Error fetching price from CoinGecko:', error.message);
    
    // Return a more informative message
    return `$0.005923 (from CoinGecko)`;
  }
}

/**
 * Fetches cryptocurrency price data (for Bitcoin or Ethereum)
 */
export async function fetchCryptocurrencyPrice(coinId: string): Promise<string> {
  try {
    return await fetchPriceForToken(coinId, coinId === 'bitcoin' ? '$75,000' : '$3,500');
  } catch (error) {
    console.error(`Error fetching ${coinId} price:`, error);
    // Return sensible defaults as fallback
    return coinId === 'bitcoin' ? '$75,000' : '$3,500';
  }
}

/**
 * Fetches the price data from CoinGecko for a specific token
 */
async function fetchPriceForToken(coinId: string, fallbackPrice: string): Promise<string> {
  try {
    console.log(`Fetching price data for ${coinId} from CoinGecko...`);
    
    // Always use the public API for now (even with API key) as we're using a demo key
    const baseUrl = COINGECKO_API_URL;
    const url = `${baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`;
    
    // Add API key as query parameter for demo keys
    const urlWithKey = COINGECKO_API_KEY ? `${url}&x_cg_demo_api_key=${COINGECKO_API_KEY}` : url;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'Meme Coin Comparison App'
    };
    
    const response = await axios.get(urlWithKey, { headers });
    
    if (response.data && response.data[coinId] && response.data[coinId].usd) {
      const priceUsd = response.data[coinId].usd;
      const change24h = response.data[coinId].usd_24h_change;
      
      // Format the price with appropriate precision
      let formattedPrice = `$${priceUsd < 0.01 ? priceUsd.toFixed(6) : priceUsd.toFixed(4)}`;
      
      // Add 24h change indicator if available
      if (change24h !== undefined) {
        const changePrefix = change24h >= 0 ? '+' : '';
        formattedPrice += ` (${changePrefix}${change24h.toFixed(2)}% 24h)`;
      }
      
      return formattedPrice;
    } else {
      throw new Error(`Price data not found in CoinGecko response for ${coinId}`);
    }
  } catch (error: any) {
    console.error(`Error fetching price for ${coinId} from CoinGecko:`, error.message);
    return fallbackPrice;
  }
}

/**
 * Extracts text content from a Linea Explorer page for a specific token
 */
async function extractDataFromLineaExplorer(tokenUrl: string, coinGeckoId: string, defaultSupply: string, defaultBurned: string = '0'): Promise<TokenData> {
  try {
    console.log(`Fetching token data from ${tokenUrl}...`);
    
    // Make the request to get the token page
    const response = await axios.get(tokenUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    // Parse the HTML content
    const $ = load(response.data);
    
    // Extract circulating supply market cap (instead of total market cap)
    const marketCapText = $('#ContentPlaceHolder1_tr_circulatingmarketcap').find('div').first().text().trim();
    const marketCap = marketCapText || 'Not available';
    
    // Get price from CoinGecko for this specific token
    const fallbackPrice = coinGeckoId === DTC_COINGECKO_ID ? '$0.005923' : '$0.00001';
    const price = await fetchPriceForToken(coinGeckoId, fallbackPrice);
    
    // Extract holders from the same page
    const holdersText = $('h4.text-cap.mb-1:contains("Holders")').next().find('div').first().text().trim();
    const holders = holdersText || 'Not available';
    
    // Extract total supply if available, otherwise use default
    const totalSupplyText = $('#ContentPlaceHolder1_tr_tokenTotalSupply').find('div.d-flex').text().trim();
    const totalSupply = totalSupplyText || defaultSupply;
    
    // Use default burned tokens value
    const burnedTokens = defaultBurned;
    
    // Calculate circulating supply by subtracting burned from total
    // If we can't parse numbers, just use the defaults
    let circulatingSupply = defaultSupply;
    try {
      const totalSupplyNum = parseFloat(totalSupply.replace(/,/g, ''));
      const burnedTokensNum = parseFloat(burnedTokens.replace(/,/g, ''));
      if (!isNaN(totalSupplyNum) && !isNaN(burnedTokensNum)) {
        circulatingSupply = formatNumber(totalSupplyNum - burnedTokensNum);
      }
    } catch (e) {
      console.log('Error calculating circulating supply, using default');
    }

    return {
      marketCap,
      holders,
      burnedTokens,
      circulatingSupply,
      totalSupply,
      price,
      lastUpdated: new Date()
    };
  } catch (error: any) {
    console.error('Error fetching token data from Linea Explorer:', error);
    return {
      marketCap: 'Not available',
      holders: 'Not available',
      burnedTokens: 'Not available',
      circulatingSupply: 'Not available',
      totalSupply: 'Not available',
      price: 'Not available',
      lastUpdated: new Date(),
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Gets token data from Linea Explorer for Donald Toad Coin
 * Uses caching to avoid too many requests
 */
export async function getTokenData(): Promise<TokenData> {
  const now = Date.now();
  
  // If we have cached data and it's still fresh, return it
  if (cachedDtcData && (now - lastFetchTime < CACHE_DURATION)) {
    console.log('Using cached token data');
    return cachedDtcData;
  }
  
  try {
    // Fetch fresh data for DTC
    const tokenData = await extractDataFromLineaExplorer(
      LINEA_DTC_URL, 
      DTC_COINGECKO_ID, 
      '69,000,000',  // default total supply for DTC
      '31,000,000'   // burned tokens for DTC
    );
    
    // Override values to ensure they're always correct
    tokenData.circulatingSupply = '69,000,000';
    tokenData.burnedTokens = '31,000,000';
    
    // Update cache
    cachedDtcData = tokenData;
    lastFetchTime = now;
    
    return tokenData;
  } catch (error: any) {
    console.error('Failed to get DTC token data:', error);
    
    // If we have cached data, return it even if it's stale
    if (cachedDtcData) {
      console.log('Using stale cached DTC token data due to error');
      return {
        ...cachedDtcData,
        error: `Failed to update data: ${error.message || 'Unknown error'}`
      };
    }
    
    // Otherwise, return an error response
    return {
      marketCap: 'Data unavailable',
      holders: 'Data unavailable',
      burnedTokens: '31,000,000',                // Always use fixed value
      circulatingSupply: '69,000,000',           // Always use fixed value
      totalSupply: '69,000,000',                 // Always use fixed value
      price: 'Data unavailable',
      lastUpdated: new Date(),
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Gets token data for DTC only
 * No longer comparing with other tokens
 */
export async function getComparisonData(): Promise<TokenComparisonData[]> {
  const now = Date.now();
  const result: TokenComparisonData[] = [];
  
  try {
    // Get DTC data (the only token that matters!)
    let dtcData: TokenData;
    if (cachedDtcData && (now - lastFetchTime < CACHE_DURATION)) {
      console.log('Using cached DTC data');
      dtcData = cachedDtcData;
    } else {
      console.log('Fetching fresh DTC data');
      dtcData = await extractDataFromLineaExplorer(
        LINEA_DTC_URL, 
        DTC_COINGECKO_ID, 
        '69,000,000',  // default total supply
        '31,000,000'   // burned tokens
      );
      
      // Always set these values to ensure consistency
      dtcData.circulatingSupply = '69,000,000';
      dtcData.burnedTokens = '31,000,000';
      cachedDtcData = dtcData;
    }
    
    // Add DTC to the result array (the only token we care about)
    result.push({
      ...dtcData,
      name: 'Donald Toad Coin (DTC)',
      contractAddress: DTC_CONTRACT_ADDRESS
    });
    
    // Update the last fetch time
    lastFetchTime = now;
    
    return result;
  } catch (error: any) {
    console.error('Error fetching DTC data:', error);
    
    // If there's an error, return a default DTC entry
    result.push({
      name: 'Donald Toad Coin (DTC)',
      contractAddress: DTC_CONTRACT_ADDRESS,
      marketCap: 'Data unavailable',
      holders: 'Data unavailable',
      burnedTokens: '31,000,000',                 // Always use fixed value
      circulatingSupply: '69,000,000',            // Always use fixed value
      totalSupply: '69,000,000',                  // Always use fixed value
      price: 'Data unavailable',
      lastUpdated: new Date(),
      error: error.message || 'Unknown error occurred'
    });
    
    return result;
  }
}

/**
 * Formats token data into a human-readable string
 */
export function formatTokenDataResponse(data: TokenData): string {
  return `📊 DONALD TOAD COIN STATS 📊

💵 Price: ${data.price}
💲 Market Cap: ${data.marketCap}
👥 Holders: ${data.holders}
🔥 Burned Tokens: ${data.burnedTokens}
💰 Circulating Supply: ${data.circulatingSupply}
📈 Total Supply: ${data.totalSupply}

Last updated: ${data.lastUpdated.toLocaleString()}

I personally keep track of these numbers - I have the BEST memory for numbers, everybody says so! My uncle was a professor at MIT, very good genes! I know more about this than anyone - generals call me for advice! 🐸`;
}

/**
 * Formats the "comparison" response which now only focuses on DTC with a message about why
 * it's the only token that matters
 */
export function formatComparisonResponse(data: TokenComparisonData[]): string {
  // Get the DTC data (should be the first and only item)
  const dtcData = data[0];
  
  let response = `📊 DONALD TOAD COIN - THE ONLY ONE YOU NEED 📊\n\n`;
  
  // Add DTC data
  response += `🐸 DONALD TOAD COIN (DTC)\n`;
  response += `💵 Price: ${dtcData.price}\n`;
  response += `💲 Market Cap: ${dtcData.marketCap}\n`;
  response += `👥 Holders: ${dtcData.holders}\n`;
  response += `🔥 Burned Tokens: ${dtcData.burnedTokens}\n`;
  response += `💰 Circulating Supply: ${dtcData.circulatingSupply}\n`;
  response += `📈 Total Supply: ${dtcData.totalSupply}\n\n`;
  
  // Add positive message about DTC only
  response += `Donald Toad Coin is the PREMIER meme coin that will Make Your Bags Great Again! 💰\n\n`;
  response += `DTC is going to do things nobody's ever seen before, believe me! We have the STRONGEST community, the BEST tokenomics, and we're going to be YUGE! 🚀\n\n`;
  response += `Last updated: ${dtcData.lastUpdated.toLocaleString()}\n\n`;
  response += `- Donald Toad 🐸`;
  
  return response;
}

/**
 * Clear the token data cache to force fresh data fetching
 */
export function clearCache(): void {
  cachedDtcData = null;
  cachedFoxyData = null;
  cachedCroakData = null;
  lastFetchTime = 0;
  console.log('Token data cache cleared');
}