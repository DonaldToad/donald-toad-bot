// This file is no longer used - image generation feature has been removed

// Define categories of themed images with public domain sources
interface ImageCategory {
  name: string;
  keywords: string[];
  images: string[];
}

// Categories and keywords for image matching
export const imageCategories: ImageCategory[] = [
  {
    name: "toad",
    keywords: ["toad", "frog", "donald", "amphibian", "green"],
    images: [
      "https://cdn.pixabay.com/photo/2018/07/12/04/02/frog-3532066_1280.jpg",
      "https://cdn.pixabay.com/photo/2016/04/17/20/45/frog-1335824_1280.jpg",
      "https://cdn.pixabay.com/photo/2012/07/30/09/49/tiger-leg-monkey-frog-53554_1280.jpg",
      "https://cdn.pixabay.com/photo/2015/10/01/16/43/frog-967674_1280.jpg",
      "https://cdn.pixabay.com/photo/2013/12/20/14/24/red-eyed-tree-frog-231073_1280.jpg"
    ]
  },
  {
    name: "president",
    keywords: ["president", "speech", "suit", "white house", "podium", "election", "politics", "campaign"],
    images: [
      "https://cdn.pixabay.com/photo/2019/05/30/13/13/white-house-4239898_1280.jpg",
      "https://cdn.pixabay.com/photo/2016/08/16/16/39/washington-1598453_1280.jpg",
      "https://cdn.pixabay.com/photo/2019/04/13/00/47/washington-4123766_1280.jpg",
      "https://cdn.pixabay.com/photo/2018/02/27/06/30/the-white-house-3184798_1280.jpg",
      "https://cdn.pixabay.com/photo/2014/10/20/12/34/usa-495480_1280.jpg"
    ]
  },
  {
    name: "american-flag",
    keywords: ["flag", "american", "america", "usa", "patriot", "patriotic", "stars and stripes"],
    images: [
      "https://cdn.pixabay.com/photo/2013/07/12/19/19/usa-154655_1280.png",
      "https://cdn.pixabay.com/photo/2016/08/16/16/37/independence-day-1598447_1280.jpg",
      "https://cdn.pixabay.com/photo/2019/07/03/13/48/july-fourth-4314729_1280.jpg",
      "https://cdn.pixabay.com/photo/2018/04/26/15/13/usa-3351874_1280.jpg",
      "https://cdn.pixabay.com/photo/2017/06/09/14/45/american-flag-2387110_1280.jpg"
    ]
  },
  {
    name: "money",
    keywords: ["money", "cash", "dollar", "coin", "crypto", "bitcoin", "rich", "wealth", "dtc", "finance", "stock"],
    images: [
      "https://cdn.pixabay.com/photo/2019/06/19/19/52/bitcoin-4284899_1280.jpg",
      "https://cdn.pixabay.com/photo/2017/08/30/07/56/money-2696228_1280.jpg",
      "https://cdn.pixabay.com/photo/2016/04/20/12/58/bitcoin-1341604_1280.jpg",
      "https://cdn.pixabay.com/photo/2015/09/15/16/35/bitcoin-941290_1280.jpg",
      "https://cdn.pixabay.com/photo/2019/06/03/22/01/binary-options-4250364_1280.jpg"
    ]
  },
  {
    name: "moon",
    keywords: ["moon", "crypto moon", "to the moon", "rocket", "space", "sky", "night", "lunar"],
    images: [
      "https://cdn.pixabay.com/photo/2016/10/20/18/35/earth-1756274_1280.jpg",
      "https://cdn.pixabay.com/photo/2016/01/19/17/57/moon-1149897_1280.jpg",
      "https://cdn.pixabay.com/photo/2016/03/18/15/02/ufo-1265186_1280.jpg",
      "https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_1280.jpg",
      "https://cdn.pixabay.com/photo/2017/09/16/16/09/moon-2755897_1280.jpg"
    ]
  },
  {
    name: "computer",
    keywords: ["computer", "laptop", "tech", "technology", "internet", "coding", "programmer", "blockchain"],
    images: [
      "https://cdn.pixabay.com/photo/2017/05/10/19/29/robot-2301646_1280.jpg",
      "https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_1280.jpg",
      "https://cdn.pixabay.com/photo/2016/11/19/14/16/man-1839500_1280.jpg",
      "https://cdn.pixabay.com/photo/2018/05/08/08/44/artificial-intelligence-3382507_1280.jpg",
      "https://cdn.pixabay.com/photo/2014/05/02/21/50/home-office-336378_1280.jpg"
    ]
  },
  {
    name: "success",
    keywords: ["success", "winner", "winning", "victory", "achieve", "achievement", "trophy", "champion"],
    images: [
      "https://cdn.pixabay.com/photo/2017/06/10/07/21/success-2389526_1280.jpg",
      "https://cdn.pixabay.com/photo/2015/11/26/07/47/hands-1063442_1280.jpg",
      "https://cdn.pixabay.com/photo/2018/05/10/20/00/success-3389116_1280.jpg",
      "https://cdn.pixabay.com/photo/2015/12/11/09/30/mobile-phone-1087845_1280.jpg",
      "https://cdn.pixabay.com/photo/2019/03/28/09/25/the-road-to-success-4086063_1280.jpg"
    ]
  },
  {
    name: "funny",
    keywords: ["funny", "joke", "humor", "comedy", "laugh", "lol", "meme"],
    images: [
      "https://cdn.pixabay.com/photo/2019/08/10/02/29/squirrel-4396851_1280.jpg",
      "https://cdn.pixabay.com/photo/2015/03/27/13/16/maine-coon-694730_1280.jpg",
      "https://cdn.pixabay.com/photo/2017/09/25/13/12/puppy-2785074_1280.jpg",
      "https://cdn.pixabay.com/photo/2016/01/03/00/43/upload-1118929_1280.jpg",
      "https://cdn.pixabay.com/photo/2017/05/12/11/29/girl-2306829_1280.jpg"
    ]
  },
  {
    name: "landscape",
    keywords: ["landscape", "nature", "mountain", "beach", "ocean", "tree", "forest", "river", "view"],
    images: [
      "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg",
      "https://cdn.pixabay.com/photo/2015/12/01/20/28/road-1072821_1280.jpg",
      "https://cdn.pixabay.com/photo/2013/10/02/23/03/mountains-190055_1280.jpg",
      "https://cdn.pixabay.com/photo/2016/08/11/23/48/mountains-1587287_1280.jpg",
      "https://cdn.pixabay.com/photo/2013/07/18/20/26/sea-164989_1280.jpg"
    ]
  }
];

// Special themed image combinations that match multiple categories
const specialThemes = [
  {
    name: "donald-toad-president",
    keywords: ["donald toad president", "toad president", "donald president"],
    images: [
      "https://cdn.pixabay.com/photo/2013/07/12/19/19/usa-154655_1280.png",
      "https://cdn.pixabay.com/photo/2019/05/30/13/13/white-house-4239898_1280.jpg",
      "https://cdn.pixabay.com/photo/2015/10/01/16/43/frog-967674_1280.jpg"
    ]
  },
  {
    name: "crypto-toad",
    keywords: ["crypto toad", "crypto frog", "toad coin", "frog coin", "toad money", "frog money"],
    images: [
      "https://cdn.pixabay.com/photo/2019/06/19/19/52/bitcoin-4284899_1280.jpg",
      "https://cdn.pixabay.com/photo/2018/07/12/04/02/frog-3532066_1280.jpg",
      "https://cdn.pixabay.com/photo/2017/08/30/07/56/money-2696228_1280.jpg"
    ]
  },
  {
    name: "toad-moon",
    keywords: ["toad moon", "frog moon", "toad space", "frog space", "crypto moon", "to the moon"],
    images: [
      "https://cdn.pixabay.com/photo/2016/10/20/18/35/earth-1756274_1280.jpg",
      "https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_1280.jpg",
      "https://cdn.pixabay.com/photo/2013/12/20/14/24/red-eyed-tree-frog-231073_1280.jpg"
    ]
  }
];

/**
 * Get the most relevant image for a prompt
 * This function analyzes the prompt and returns the most appropriate image URL
 * 
 * @param prompt User's image request text
 * @returns URL to a relevant image
 */
export function getImageForPrompt(prompt: string): string {
  // Clean and normalize the prompt
  const cleanPrompt = prompt.toLowerCase().trim();
  
  // 1. First check for special theme combinations
  for (const theme of specialThemes) {
    // Check if prompt contains any of the theme keywords
    if (theme.keywords.some(keyword => cleanPrompt.includes(keyword))) {
      // Get a random image from the theme
      return theme.images[Math.floor(Math.random() * theme.images.length)];
    }
  }
  
  // 2. Process standard categories if no special theme was found
  // Track matched categories and their match scores
  const matchedCategories = new Map<ImageCategory, number>();
  
  // Split prompt into words
  const words = cleanPrompt.split(/\s+/);
  
  // Match words against category keywords
  for (const category of imageCategories) {
    let score = 0;
    
    // Check each word in the prompt against the category keywords
    for (const word of words) {
      if (word.length < 3) continue; // Skip very short words
      
      if (category.keywords.includes(word)) {
        score += 10; // Exact match is worth more
      } else {
        // Check for partial matches
        for (const keyword of category.keywords) {
          if (keyword.includes(word) || word.includes(keyword)) {
            score += 5; // Partial match
            break;
          }
        }
      }
    }
    
    // Also check if the full prompt contains any of the keywords
    for (const keyword of category.keywords) {
      if (cleanPrompt.includes(keyword)) {
        score += 3; // Bonus for containing the keyword
      }
    }
    
    if (score > 0) {
      matchedCategories.set(category, score);
    }
  }
  
  // If we have matched categories, return from the one with highest score
  if (matchedCategories.size > 0) {
    // Convert to array and sort categories by score (highest first)
    const entries = Array.from(matchedCategories.entries());
    const sortedCategories = entries.sort((a, b) => b[1] - a[1]);
    
    // Get the top category
    const topCategory = sortedCategories[0][0];
    
    // Get a random image from the top category
    return topCategory.images[Math.floor(Math.random() * topCategory.images.length)];
  }
  
  // 3. Fallback: if no categories matched or no suitable image was found
  // Use a general-purpose image that's always acceptable
  const fallbackImages = [
    "https://cdn.pixabay.com/photo/2015/10/01/16/43/frog-967674_1280.jpg",
    "https://cdn.pixabay.com/photo/2018/07/12/04/02/frog-3532066_1280.jpg",
    "https://cdn.pixabay.com/photo/2016/04/17/20/45/frog-1335824_1280.jpg",
    "https://cdn.pixabay.com/photo/2019/06/19/19/52/bitcoin-4284899_1280.jpg",
    "https://cdn.pixabay.com/photo/2017/06/09/14/45/american-flag-2387110_1280.jpg"
  ];
  
  return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
}