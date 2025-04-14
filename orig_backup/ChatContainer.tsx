import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { FaFrog } from "react-icons/fa";
import { ClientMessage } from "@/lib/types";
import { motion } from "framer-motion";

interface ChatContainerProps {
  messages: ClientMessage[];
  isLoading: boolean;
}

export default function ChatContainer({ messages, isLoading }: ChatContainerProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change or on typing
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={chatContainerRef} 
      className="chat-container flex-1 space-y-4 mb-4 overflow-y-auto p-4 bg-gradient-to-b from-orange-50 to-white rounded-lg"
      style={{
        backgroundImage: "radial-gradient(circle at 10% 20%, rgba(253, 186, 116, 0.05) 0%, rgba(255, 255, 255, 0) 90%)"
      }}
    >
      {messages.length === 0 && (
        <motion.div 
          className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4 py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "loop" 
            }}
          >
            <FaFrog className="w-16 h-16 text-green-500" />
          </motion.div>
          <motion.h3 
            className="text-2xl font-bold text-orange-500"
            animate={{ 
              color: ["#f97316", "#f59e0b", "#f97316"] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            Welcome to Donald Toad Chat!
          </motion.h3>
          <p className="text-lg max-w-md">Ask anything and get responses in the style of Donald Toad. TREMENDOUS answers guaranteed!</p>
        </motion.div>
      )}
    
      {messages.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
        />
      ))}
      
      {isLoading && <TypingIndicator />}
    </div>
  );
}
