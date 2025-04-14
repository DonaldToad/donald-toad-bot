import { FaFrog } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import { ClientMessage } from "@/lib/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MessageBubbleProps {
  message: ClientMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [displayContent, setDisplayContent] = useState(message.visibleContent || '');
  const [isTyping, setIsTyping] = useState(message.status === "typing");
  const [typingComplete, setTypingComplete] = useState(false);
  
  // Typing animation effect for assistant messages
  useEffect(() => {
    if (message.role === "assistant" && message.status !== "typing") {
      let currentPosition = 0;
      const fullContent = message.content;
      
      // Don't animate if content is already visible
      if (displayContent === fullContent) {
        setTypingComplete(true);
        return;
      }
      
      // Typing speed (characters per interval)
      const typingSpeed = 15; 
      
      // Random delay between 20-50ms to simulate realistic typing
      const getRandomDelay = () => Math.floor(Math.random() * 30) + 20;
      
      const typeCharacter = () => {
        if (currentPosition < fullContent.length) {
          // Calculate how many characters to add (1-3 depending on typing speed)
          const charsToAdd = Math.min(typingSpeed, fullContent.length - currentPosition);
          
          // Get the next chunk of text
          const nextChunk = fullContent.substring(currentPosition, currentPosition + charsToAdd);
          
          // Update position and content
          currentPosition += charsToAdd;
          setDisplayContent(prevContent => prevContent + nextChunk);
          
          // Schedule next update with slight randomization to make it look natural
          setTimeout(typeCharacter, getRandomDelay());
        } else {
          setTypingComplete(true);
        }
      };
      
      // Start typing after a short delay
      setTimeout(typeCharacter, 300);
    }
  }, [message.content, message.role, message.status, displayContent]);
  
  // Format message content for HTML display (simple Markdown-like processing)
  const formatContent = (content: string) => {
    // Handle embedding images (match URLs ending with common image extensions)
    let formattedContent = content;
    
    // Process all image URLs and Markdown image syntax - improved regex to handle more cases
    // First, handle Markdown-style image tags: ![alt text](imageURL)
    const markdownImageRegex = /!\[(.*?)\]\((https?:\/\/\S+\.(jpg|jpeg|png|gif|webp)(\?\S*)?|https?:\/\/img\.freepik\.com\/\S+|https?:\/\/raw\.githubusercontent\.com\/\S+)\)/gi;
    formattedContent = formattedContent.replace(markdownImageRegex, (match, alt, url) => {
      return `<div class="my-3 flex justify-center"><img src="${url}" alt="${alt || 'Donald Toad Image'}" class="rounded-lg max-w-full md:max-w-md shadow-md border-2 border-orange-300 hover:border-orange-500 transition-all" /></div>`;
    });
    
    // Then, handle plain image URLs in case they weren't caught by the Markdown pattern
    const plainImageRegex = /(https?:\/\/\S+\.(jpg|jpeg|png|gif|webp)(\?\S*)?|https?:\/\/img\.freepik\.com\/\S+|https?:\/\/raw\.githubusercontent\.com\/\S+)/gi;
    formattedContent = formattedContent.replace(plainImageRegex, (match) => {
      // Only replace if it's not already part of an image tag
      if (!formattedContent.includes(`src="${match}"`)) {
        return `<div class="my-3 flex justify-center"><img src="${match}" alt="Donald Toad Image" class="rounded-lg max-w-full md:max-w-md shadow-md border-2 border-orange-300 hover:border-orange-500 transition-all" /></div>`;
      }
      return match;
    });
    
    // Handle lists
    formattedContent = formattedContent.replace(/\n- (.*)/g, '<li>$1</li>');
    if (formattedContent.includes('<li>')) {
      formattedContent = formattedContent.replace(/<li>/, '<ul class="list-disc pl-5 mt-2 space-y-1"><li>');
      formattedContent += '</ul>';
    }
    
    // Handle numbered lists
    formattedContent = formattedContent.replace(/\n\d+\. (.*)/g, '<li>$1</li>');
    if (formattedContent.includes('<li>') && !formattedContent.includes('<ul>')) {
      formattedContent = formattedContent.replace(/<li>/, '<ol class="list-decimal pl-5 mt-2 space-y-1"><li>');
      formattedContent += '</ol>';
    }
    
    // Handle paragraphs
    const paragraphs = formattedContent.split('\n\n');
    if (paragraphs.length > 1) {
      formattedContent = paragraphs.map(p => `<p>${p}</p>`).join('');
    }
    
    // Handle bold text
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Emphasize CAPITALIZED words (Donald Toad style)
    formattedContent = formattedContent.replace(/\b([A-Z]{3,})\b/g, '<span class="font-bold text-orange-600">$1</span>');
    
    return formattedContent;
  };

  // Process message content to extract any image URLs for special display
  const processMessageContent = () => {
    if (message.role === "user") {
      return <p>{message.content}</p>;
    } else {
      // If this is an assistant message that's being typed
      if (message.status === "typing") {
        return null; // We'll show the typing indicator instead
      }
      
      // Use the animated content that's progressively revealed
      const contentToDisplay = displayContent || message.content;
      return <div dangerouslySetInnerHTML={{ __html: formatContent(contentToDisplay) }} />;
    }
  };

  // Cursor animation for when typing is complete but we want to show the cursor for a moment
  const cursorVariants = {
    blinking: {
      opacity: [0, 1, 0]
    }
  };

  if (message.role === "user") {
    return (
      <div className="flex items-start justify-end mb-4">
        <motion.div 
          className="message-bubble p-3 bg-blue-100 text-gray-800 rounded-lg rounded-tr-none shadow-sm border border-blue-200 max-w-[80%]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {processMessageContent()}
        </motion.div>
        <div className="ml-2 flex-shrink-0 text-blue-500">
          <IoPersonCircle size={32} />
        </div>
      </div>
    );
  }

  // If this is a typing message, show the typing indicator
  if (message.status === "typing") {
    return (
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-500 text-green-600 flex items-center justify-center mr-2 border-2 border-green-600">
          <FaFrog className="text-xl" />
        </div>
        <motion.div 
          className="message-bubble p-3 bg-gradient-to-br from-orange-100 to-orange-200 text-gray-800 rounded-lg rounded-tl-none shadow-sm border border-orange-300 max-w-[80%]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="typing-indicator flex items-center h-6">
            <motion.span 
              className="w-2 h-2 bg-orange-500 rounded-full mx-0.5"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop", delay: 0 }}
            />
            <motion.span 
              className="w-2 h-2 bg-orange-500 rounded-full mx-0.5"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop", delay: 0.15 }}
            />
            <motion.span 
              className="w-2 h-2 bg-orange-500 rounded-full mx-0.5"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop", delay: 0.3 }}
            />
            
            <motion.span 
              className="ml-2 font-medium text-orange-600"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
            >
              Donald Toad is typing...
            </motion.span>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Regular assistant message with typing animation effect
  return (
    <div className="flex items-start mb-4">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-500 text-green-600 flex items-center justify-center mr-2 border-2 border-green-600">
        <FaFrog className="text-xl" />
      </div>
      <motion.div 
        className="message-bubble p-3 bg-gradient-to-br from-orange-100 to-orange-200 text-gray-800 rounded-lg rounded-tl-none shadow-sm border border-orange-300 max-w-[80%]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {processMessageContent()}
        {!typingComplete && (
          <motion.span
            className="inline-block w-2 h-4 ml-1 bg-orange-500"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop" }}
          />
        )}
      </motion.div>
    </div>
  );
}
