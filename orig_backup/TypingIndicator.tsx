import { FaFrog } from "react-icons/fa";
import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <div className="flex items-start mb-4">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-500 text-green-600 flex items-center justify-center mr-2 border-2 border-green-600">
        <FaFrog className="text-xl" />
      </div>
      <motion.div 
        className="message-bubble p-3 bg-gradient-to-br from-orange-100 to-orange-200 text-gray-800 rounded-lg rounded-tl-none shadow-sm border border-orange-300"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="typing-indicator flex items-center h-6">
          <motion.span 
            className="w-2.5 h-2.5 bg-orange-500 rounded-full mx-0.5"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop", delay: 0 }}
          />
          <motion.span 
            className="w-2.5 h-2.5 bg-orange-500 rounded-full mx-0.5"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop", delay: 0.15 }}
          />
          <motion.span 
            className="w-2.5 h-2.5 bg-orange-500 rounded-full mx-0.5"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop", delay: 0.3 }}
          />
          
          <motion.span 
            className="ml-2 font-medium text-orange-600"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
          >
            Donald Toad is typing...
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}