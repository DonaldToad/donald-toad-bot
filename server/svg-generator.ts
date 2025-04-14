// This file is no longer used - image generation feature has been removed

// SVG Templates for different image types
const svgTemplates = {
  // Base template for toad character
  toadBase: (text: string, color: string) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#f0f8ff"/>
    <text x="300" y="40" font-family="Impact, sans-serif" font-size="22" text-anchor="middle" fill="#333">Donald Toad: ${text}</text>
    <ellipse cx="300" cy="220" rx="100" ry="90" fill="${color}"/>
    <circle cx="260" cy="180" r="20" fill="white"/>
    <circle cx="340" cy="180" r="20" fill="white"/>
    <circle cx="260" cy="180" r="10" fill="black"/>
    <circle cx="340" cy="180" r="10" fill="black"/>
    <path d="M 250 250 C 270 280, 330 280, 350 250" fill="none" stroke="black" stroke-width="5"/>
  </svg>`,
  
  // Presidential themed template
  president: (text: string) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="podiumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#b58a4a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#8b5a2b;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="#f9f9f9"/>
    <rect x="0" y="0" width="600" height="80" fill="#204080"/>
    <text x="300" y="50" font-family="Impact, sans-serif" font-size="30" text-anchor="middle" fill="white">PRESIDENTIAL ADDRESS</text>
    <rect x="150" y="320" width="300" height="80" fill="url(#podiumGrad)"/>
    <ellipse cx="300" cy="320" rx="80" ry="30" fill="#8b5a2b"/>
    <text x="300" y="340" font-family="Impact, sans-serif" font-size="20" text-anchor="middle" fill="white">Donald Toad</text>
    <ellipse cx="300" cy="220" rx="70" ry="70" fill="#4CAF50"/>
    <circle cx="270" cy="200" r="15" fill="white"/>
    <circle cx="330" cy="200" r="15" fill="white"/>
    <circle cx="270" cy="200" r="8" fill="black"/>
    <circle cx="330" cy="200" r="8" fill="black"/>
    <path d="M 260 240 C 280 260, 320 260, 340 240" fill="none" stroke="black" stroke-width="4"/>
    <path d="M 240 180 C 220 160, 240 120, 270 140" fill="#4CAF50" stroke="#333" stroke-width="2"/>
    <path d="M 360 180 C 380 160, 360 120, 330 140" fill="#4CAF50" stroke="#333" stroke-width="2"/>
    
    <!-- American flag background -->
    <rect x="400" y="120" width="120" height="80" fill="#204080"/>
    <g id="stars">
      <circle cx="415" cy="135" r="5" fill="white"/>
      <circle cx="435" cy="135" r="5" fill="white"/>
      <circle cx="455" cy="135" r="5" fill="white"/>
      <circle cx="475" cy="135" r="5" fill="white"/>
      <circle cx="495" cy="135" r="5" fill="white"/>
      
      <circle cx="425" cy="150" r="5" fill="white"/>
      <circle cx="445" cy="150" r="5" fill="white"/>
      <circle cx="465" cy="150" r="5" fill="white"/>
      <circle cx="485" cy="150" r="5" fill="white"/>
      
      <circle cx="415" cy="165" r="5" fill="white"/>
      <circle cx="435" cy="165" r="5" fill="white"/>
      <circle cx="455" cy="165" r="5" fill="white"/>
      <circle cx="475" cy="165" r="5" fill="white"/>
      <circle cx="495" cy="165" r="5" fill="white"/>
    </g>
    <rect x="400" y="180" width="120" height="10" fill="#B22234"/>
    <rect x="400" y="190" width="120" height="10" fill="white"/>
    <rect x="400" y="200" width="120" height="10" fill="#B22234"/>
    <rect x="400" y="210" width="120" height="10" fill="white"/>
    <rect x="400" y="220" width="120" height="10" fill="#B22234"/>
    <rect x="400" y="230" width="120" height="10" fill="white"/>
    <rect x="400" y="240" width="120" height="10" fill="#B22234"/>
    <rect x="400" y="250" width="120" height="10" fill="white"/>
    
    <!-- Speech bubble with text -->
    <path d="M 360 160 C 400 140, 440 160, 400 190 L 380 210 L 390 180 C 360 170, 330 140, 360 160" fill="white" stroke="#333" stroke-width="2"/>
    <text x="380" y="170" font-family="Comic Sans MS, sans-serif" font-size="12" text-anchor="middle">${text}</text>
  </svg>`,
  
  // Money-themed template
  money: (text: string) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="moneyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#85bb65;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1e7145;stop-opacity:1" />
      </linearGradient>
      <filter id="gold" x="-0.2" y="-0.2" width="1.4" height="1.4">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feBlend in="SourceGraphic" in2="blur" mode="normal"/>
      </filter>
    </defs>
    <rect width="600" height="400" fill="url(#moneyGrad)"/>
    <text x="300" y="50" font-family="Impact, sans-serif" font-size="30" text-anchor="middle" fill="white">CRYPTO TOAD</text>
    <ellipse cx="300" cy="220" rx="80" ry="70" fill="#4CAF50"/>
    <circle cx="260" cy="190" r="18" fill="white"/>
    <circle cx="340" cy="190" r="18" fill="white"/>
    <circle cx="260" cy="190" r="9" fill="black"/>
    <circle cx="340" cy="190" r="9" fill="black"/>
    <path d="M 250 240 C 280 270, 320 270, 350 240" fill="none" stroke="black" stroke-width="5"/>
    
    <!-- Money symbols -->
    <circle cx="170" cy="150" r="40" fill="#F9D030" stroke="#8B6914" stroke-width="3" filter="url(#gold)"/>
    <text x="170" y="165" font-family="Arial, sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="#8B6914">$</text>
    
    <circle cx="430" cy="150" r="40" fill="#F9D030" stroke="#8B6914" stroke-width="3" filter="url(#gold)"/>
    <text x="430" y="165" font-family="Arial, sans-serif" font-size="30" font-weight="bold" text-anchor="middle" fill="#8B6914">₿</text>
    
    <circle cx="170" cy="280" r="40" fill="#F9D030" stroke="#8B6914" stroke-width="3" filter="url(#gold)"/>
    <text x="170" y="290" font-family="Arial, sans-serif" font-size="30" font-weight="bold" text-anchor="middle" fill="#8B6914">€</text>
    
    <circle cx="430" cy="280" r="40" fill="#F9D030" stroke="#8B6914" stroke-width="3" filter="url(#gold)"/>
    <text x="430" y="290" font-family="Arial, sans-serif" font-size="30" font-weight="bold" text-anchor="middle" fill="#8B6914">¥</text>
    
    <!-- Speech bubble with text -->
    <path d="M 300 120 C 340 100, 380 120, 340 150 L 320 170 L 330 140 C 300 130, 270 100, 300 120" fill="white" stroke="#333" stroke-width="2"/>
    <text x="320" y="130" font-family="Comic Sans MS, sans-serif" font-size="12" text-anchor="middle">${text}</text>
    
    <!-- Crown on the toad -->
    <path d="M 250 150 L 270 170 L 300 140 L 330 170 L 350 150 L 335 130 L 265 130 Z" fill="#F9D030" stroke="#8B6914" stroke-width="2" filter="url(#gold)"/>
  </svg>`,
  
  // Space-themed template
  space: (text: string) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <radialGradient id="spaceGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style="stop-color:#2c3e50;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#000020;stop-opacity:1" />
      </radialGradient>
    </defs>
    <rect width="600" height="400" fill="url(#spaceGrad)"/>
    
    <!-- Stars -->
    <g id="stars">
      <circle cx="50" cy="50" r="1" fill="white"/>
      <circle cx="100" cy="150" r="1.5" fill="white"/>
      <circle cx="200" cy="80" r="1" fill="white"/>
      <circle cx="300" cy="40" r="1.5" fill="white"/>
      <circle cx="400" cy="70" r="1" fill="white"/>
      <circle cx="500" cy="50" r="1.5" fill="white"/>
      <circle cx="550" cy="150" r="1" fill="white"/>
      <circle cx="70" cy="200" r="1.5" fill="white"/>
      <circle cx="150" cy="350" r="1" fill="white"/>
      <circle cx="250" cy="330" r="1.5" fill="white"/>
      <circle cx="350" cy="370" r="1" fill="white"/>
      <circle cx="450" cy="340" r="1.5" fill="white"/>
      <circle cx="520" cy="300" r="1" fill="white"/>
      <circle cx="80" cy="260" r="1" fill="white"/>
      <circle cx="170" cy="50" r="1.5" fill="white"/>
      <circle cx="270" cy="120" r="1" fill="white"/>
      <circle cx="370" cy="90" r="1.5" fill="white"/>
      <circle cx="470" cy="130" r="1" fill="white"/>
      <circle cx="550" cy="220" r="1.5" fill="white"/>
      <circle cx="130" cy="280" r="1" fill="white"/>
      <circle cx="230" cy="240" r="1.5" fill="white"/>
      <circle cx="330" cy="310" r="1" fill="white"/>
      <circle cx="430" cy="250" r="1.5" fill="white"/>
      <circle cx="500" cy="190" r="1" fill="white"/>
    </g>
    
    <!-- Moon -->
    <circle cx="150" cy="150" r="60" fill="#DDDDDD" stroke="#999999" stroke-width="1"/>
    <circle cx="120" cy="130" r="10" fill="#AAAAAA"/>
    <circle cx="180" cy="150" r="15" fill="#AAAAAA"/>
    <circle cx="150" cy="180" r="8" fill="#AAAAAA"/>
    
    <!-- Rocket ship -->
    <path d="M 400 300 L 420 150 L 440 300 Z" fill="#CC3333"/>
    <rect x="400" y="300" width="40" height="20" fill="#333333"/>
    <path d="M 390 320 L 400 300 L 400 320 Z" fill="#CC3333"/>
    <path d="M 450 320 L 440 300 L 440 320 Z" fill="#CC3333"/>
    <ellipse cx="420" cy="280" rx="15" ry="25" fill="#3399CC"/>
    
    <!-- Astronaut Toad -->
    <circle cx="300" cy="220" r="40" fill="#FFFFFF" stroke="#CCCCCC" stroke-width="5"/>
    <circle cx="300" cy="220" r="30" fill="#4CAF50"/>
    <circle cx="290" cy="210" r="8" fill="white"/>
    <circle cx="310" cy="210" r="8" fill="white"/>
    <circle cx="290" cy="210" r="4" fill="black"/>
    <circle cx="310" cy="210" r="4" fill="black"/>
    <path d="M 285 230 C 295 240, 305 240, 315 230" stroke="black" stroke-width="2" fill="none"/>
    
    <!-- Text at the top -->
    <text x="300" y="50" font-family="Impact, sans-serif" font-size="30" text-anchor="middle" fill="white">TO THE MOON!</text>
    
    <!-- Speech bubble with text -->
    <path d="M 300 150 C 330 130, 360 150, 330 170 L 310 190 L 320 160 C 290 150, 270 130, 300 150" fill="white" stroke="#333" stroke-width="2"/>
    <text x="315" y="160" font-family="Comic Sans MS, sans-serif" font-size="12" text-anchor="middle">${text}</text>
  </svg>`,
  
  // Flag-themed template
  flag: (text: string) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <!-- Sky background -->
    <rect width="600" height="400" fill="#87CEEB"/>
    
    <!-- Grass -->
    <rect x="0" y="300" width="600" height="100" fill="#228B22"/>
    
    <!-- American flag -->
    <rect x="390" y="100" width="180" height="120" fill="#FFFFFF"/>
    <rect x="390" y="100" width="180" height="9.23" fill="#B22234"/>
    <rect x="390" y="118.46" width="180" height="9.23" fill="#B22234"/>
    <rect x="390" y="136.92" width="180" height="9.23" fill="#B22234"/>
    <rect x="390" y="155.38" width="180" height="9.23" fill="#B22234"/>
    <rect x="390" y="173.84" width="180" height="9.23" fill="#B22234"/>
    <rect x="390" y="192.3" width="180" height="9.23" fill="#B22234"/>
    <rect x="390" y="210.76" width="180" height="9.24" fill="#B22234"/>
    <rect x="390" y="100" width="72" height="64.62" fill="#3C3B6E"/>
    
    <!-- Stars on flag -->
    <g fill="#FFFFFF">
      <circle cx="400" cy="105" r="2"/>
      <circle cx="415" cy="105" r="2"/>
      <circle cx="430" cy="105" r="2"/>
      <circle cx="445" cy="105" r="2"/>
      <circle cx="460" cy="105" r="2"/>
      
      <circle cx="407.5" cy="115" r="2"/>
      <circle cx="422.5" cy="115" r="2"/>
      <circle cx="437.5" cy="115" r="2"/>
      <circle cx="452.5" cy="115" r="2"/>
      
      <circle cx="400" cy="125" r="2"/>
      <circle cx="415" cy="125" r="2"/>
      <circle cx="430" cy="125" r="2"/>
      <circle cx="445" cy="125" r="2"/>
      <circle cx="460" cy="125" r="2"/>
      
      <circle cx="407.5" cy="135" r="2"/>
      <circle cx="422.5" cy="135" r="2"/>
      <circle cx="437.5" cy="135" r="2"/>
      <circle cx="452.5" cy="135" r="2"/>
      
      <circle cx="400" cy="145" r="2"/>
      <circle cx="415" cy="145" r="2"/>
      <circle cx="430" cy="145" r="2"/>
      <circle cx="445" cy="145" r="2"/>
      <circle cx="460" cy="145" r="2"/>
      
      <circle cx="407.5" cy="155" r="2"/>
      <circle cx="422.5" cy="155" r="2"/>
      <circle cx="437.5" cy="155" r="2"/>
      <circle cx="452.5" cy="155" r="2"/>
    </g>
    
    <!-- Flagpole -->
    <rect x="390" y="100" width="5" height="250" fill="#8B4513"/>
    
    <!-- Donald Toad -->
    <ellipse cx="200" cy="250" rx="80" ry="70" fill="#4CAF50"/>
    <circle cx="175" cy="230" r="15" fill="white"/>
    <circle cx="225" cy="230" r="15" fill="white"/>
    <circle cx="175" cy="230" r="8" fill="black"/>
    <circle cx="225" cy="230" r="8" fill="black"/>
    <path d="M 175 270 C 190 290, 210 290, 225 270" fill="none" stroke="black" stroke-width="4"/>
    
    <!-- Suit and tie -->
    <path d="M 145 290 C 140 310, 170 380, 200 380 C 230 380, 260 310, 255 290 Z" fill="#0C3963"/>
    <path d="M 190 290 L 200 380 L 210 290 Z" fill="#B22234"/>
    
    <!-- White House in the background -->
    <rect x="50" y="150" width="120" height="80" fill="#FFFFFF" stroke="#CCCCCC" stroke-width="2"/>
    <rect x="90" y="190" width="40" height="40" fill="#FFFFFF" stroke="#CCCCCC" stroke-width="2"/>
    <rect x="100" y="200" width="20" height="30" fill="#FFFFFF" stroke="#CCCCCC" stroke-width="2"/>
    <rect x="50" y="140" width="120" height="10" fill="#CCCCCC"/>
    <rect x="60" y="130" width="100" height="10" fill="#CCCCCC"/>
    
    <!-- Columns -->
    <rect x="60" y="150" width="5" height="40" fill="#EEEEEE" stroke="#CCCCCC" stroke-width="1"/>
    <rect x="80" y="150" width="5" height="40" fill="#EEEEEE" stroke="#CCCCCC" stroke-width="1"/>
    <rect x="100" y="150" width="5" height="40" fill="#EEEEEE" stroke="#CCCCCC" stroke-width="1"/>
    <rect x="120" y="150" width="5" height="40" fill="#EEEEEE" stroke="#CCCCCC" stroke-width="1"/>
    <rect x="140" y="150" width="5" height="40" fill="#EEEEEE" stroke="#CCCCCC" stroke-width="1"/>
    
    <!-- Title text -->
    <text x="300" y="50" font-family="Impact, sans-serif" font-size="30" text-anchor="middle" fill="#333">PRESIDENTIAL TOAD</text>
    
    <!-- Speech bubble with text -->
    <path d="M 250 180 C 280 150, 330 170, 300 210 L 280 230 L 290 200 C 260 190, 220 150, 250 180" fill="white" stroke="#333" stroke-width="2"/>
    <text x="280" y="180" font-family="Comic Sans MS, sans-serif" font-size="12" text-anchor="middle">${text}</text>
  </svg>`
};

/**
 * Make a quote from a longer text (for speech bubbles)
 * 
 * @param text Input text to truncate
 * @returns Shortened quote suitable for an SVG speech bubble
 */
function makeQuote(text: string): string {
  // Take the first 40 characters, or the full text if shorter
  if (text.length <= 40) return text;
  
  // Find the last space in the first 40 characters
  const lastSpace = text.substring(0, 40).lastIndexOf(' ');
  if (lastSpace === -1) return text.substring(0, 40) + '...';
  
  // Return up to the last space plus an ellipsis
  return text.substring(0, lastSpace) + '...';
}

/**
 * Generate either an SVG data URL or direct image URL based on platform
 * 
 * @param prompt Text prompt to generate an image for
 * @returns Either a Data URL for the generated SVG or a static image URL
 */
export function generateSvgImage(prompt: string): string {
  // Normalize the prompt
  const normalizedPrompt = prompt.toLowerCase();
  
  // Create shorter URLs for Telegram compatibility with long messages
  // Look for specific platform hints in the prompt
  const isTelegram = process.env.CURRENT_PLATFORM === 'telegram' || 
                    normalizedPrompt.includes('telegram') || 
                    normalizedPrompt.includes('bot');
  
  // For Telegram, return a static image URL to avoid message length limits
  if (isTelegram) {
    // Use static images based on keywords in the prompt
    if (normalizedPrompt.includes('president') || normalizedPrompt.includes('flag')) {
      return "https://cdn.pixabay.com/photo/2016/01/08/00/58/frog-1126907_1280.jpg";
    } else if (normalizedPrompt.includes('money') || normalizedPrompt.includes('crypto')) {
      return "https://cdn.pixabay.com/photo/2015/10/01/16/43/frog-967674_1280.jpg";
    } else if (normalizedPrompt.includes('space') || normalizedPrompt.includes('moon')) {
      return "https://cdn.pixabay.com/photo/2018/07/12/04/02/frog-3532066_1280.jpg";
    } else {
      // Default image
      return "https://cdn.pixabay.com/photo/2014/10/04/08/46/frog-473358_1280.jpg";
    }
  }
  
  // For web interface, generate proper SVG
  // Choose the appropriate template based on prompt keywords
  let svgTemplate;
  let quote = makeQuote(prompt);
  
  // Check for president/flag/political keywords
  if (normalizedPrompt.includes('president') || 
      normalizedPrompt.includes('white house') || 
      normalizedPrompt.includes('flag') || 
      normalizedPrompt.includes('speech') || 
      normalizedPrompt.includes('political') ||
      normalizedPrompt.includes('american')) {
    svgTemplate = svgTemplates.president(quote);
  }
  // Check for money/crypto keywords
  else if (normalizedPrompt.includes('money') || 
           normalizedPrompt.includes('cash') || 
           normalizedPrompt.includes('rich') || 
           normalizedPrompt.includes('coin') || 
           normalizedPrompt.includes('crypto') || 
           normalizedPrompt.includes('dollar') ||
           normalizedPrompt.includes('wealth')) {
    svgTemplate = svgTemplates.money(quote);
  }
  // Check for space/moon keywords
  else if (normalizedPrompt.includes('space') || 
           normalizedPrompt.includes('moon') || 
           normalizedPrompt.includes('rocket') || 
           normalizedPrompt.includes('planet') || 
           normalizedPrompt.includes('star') ||
           normalizedPrompt.includes('astronaut')) {
    svgTemplate = svgTemplates.space(quote);
  }
  // Check for flag keywords
  else if (normalizedPrompt.includes('flag') || 
           normalizedPrompt.includes('america') || 
           normalizedPrompt.includes('patriot') || 
           normalizedPrompt.includes('usa')) {
    svgTemplate = svgTemplates.flag(quote);
  }
  // Default to basic toad
  else {
    // Choose a random fun color
    const colors = ['#4CAF50', '#8BC34A', '#CDDC39', '#2E7D32', '#81C784'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    svgTemplate = svgTemplates.toadBase(quote, randomColor);
  }
  
  // Convert SVG to a data URL
  const svgUrl = 'data:image/svg+xml;base64,' + Buffer.from(svgTemplate).toString('base64');
  
  return svgUrl;
}