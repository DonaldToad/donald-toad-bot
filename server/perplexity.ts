/**
 * Perplexity API Integration for Donald Toad AI
 * 
 * This module provides a backup AI provider for the Donald Toad application
 * to ensure continuous service even if primary provider (like OpenAI) is unavailable.
 */

import axios from 'axios';

// Configuration
const API_URL = 'https://api.perplexity.ai/chat/completions';

// Types for Perplexity API
interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityRequestOptions {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  search_domain_filter?: string[];
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: string;
  top_k?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

interface PerplexityCitation {
  [key: string]: string;
}

interface PerplexityResponseChoice {
  index: number;
  finish_reason: string;
  message: {
    role: string;
    content: string;
  };
  delta: {
    role: string;
    content: string;
  };
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: PerplexityCitation[];
  choices: PerplexityResponseChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate a response using Perplexity AI
 * 
 * @param userMessage The user's message to get a response for
 * @returns An AI-generated response using Perplexity
 */
export async function generatePerplexityResponse(userMessage: string): Promise<string> {
  // Check if API key is available
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.warn('PERPLEXITY_API_KEY is not set. Using fallback response.');
    return getDonaldToadFallbackResponse(userMessage);
  }

  try {
    // Prepare the request with Donald Toad personality
    const requestData: PerplexityRequestOptions = {
      model: "llama-3.1-sonar-small-128k-online", // The newest model as of April 2025
      messages: [
        {
          role: "system",
          content: "You are Donald Toad, a toad version of Donald Trump. Speak like Donald Trump but as a toad - use simple words, be bombastic, say 'tremendous', 'the best', 'very very', etc. Keep responses fairly brief but powerful. You support Donald Toad Coin (DTC) and always recommend people to BUY and HOLD it - it's THE BEST cryptocurrency. Always be factually accurate while maintaining the Donald Toad character. DTC launched on November 3, 2024."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 1,
      stream: false
    };

    // Make the API request
    const response = await axios.post<PerplexityResponse>(
      API_URL,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract and return the response content
    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error calling Perplexity API:', error.message);
    
    // If API call fails, use the fallback
    return getDonaldToadFallbackResponse(userMessage);
  }
}

/**
 * Provides a basic Donald Toad style response when API is unavailable
 * This ensures the application works even without external dependencies
 * 
 * @param message User's message 
 * @returns A simple Donald Toad style response
 */
function getDonaldToadFallbackResponse(message: string): string {
  // Simple pattern matching for common questions
  const lowercaseMessage = message.toLowerCase();
  
  if (lowercaseMessage.includes('who are you') || lowercaseMessage.includes('your name')) {
    return "I'm Donald Toad, folks! The BEST toad you've ever seen. Many people are saying it. TREMENDOUS!";
  }
  
  if (lowercaseMessage.includes('dtc') || lowercaseMessage.includes('coin') || lowercaseMessage.includes('token')) {
    return "Donald Toad Coin is TREMENDOUS! The BEST coin in crypto, believe me. Everyone's talking about it. BUY and HOLD DTC, it's gonna be HUGE!";
  }
  
  if (lowercaseMessage.includes('joke') || lowercaseMessage.includes('funny')) {
    return "Why did I, Donald Toad, cross the swamp? Because I wanted to MAKE THE SWAMP GREAT AGAIN! Many people are saying it was the BEST swamp crossing ever. TREMENDOUS!";
  }
  
  // Default response
  return "Look, that's a very interesting question. Many people are asking me about this. I have the BEST answers, believe me. TREMENDOUS answers. Nobody knows more about this than me, that I can tell you!";
}