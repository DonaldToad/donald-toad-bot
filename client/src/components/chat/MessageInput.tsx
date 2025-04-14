import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { FaFrog } from "react-icons/fa";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-orange-50 rounded-lg shadow-md p-3 flex items-center space-x-2 border border-orange-200">
      <div className="text-green-600 mr-1">
        <FaFrog className="h-5 w-5" />
      </div>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Ask Donald Toad a TREMENDOUS question..."
        className="flex-1 py-2 px-3 bg-white border-orange-200"
        disabled={isLoading}
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim() || isLoading}
        className="bg-orange-500 text-white p-2 hover:bg-orange-600 transition-colors"
        size="icon"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
