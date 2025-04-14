import { useState } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FaFrog } from "react-icons/fa";

interface UsernameModalProps {
  onSubmit: (username: string) => void;
}

export default function UsernameModal({ onSubmit }: UsernameModalProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in">
      <Card className="w-full max-w-md mx-4 overflow-hidden border-4 border-orange-400">
        <div className="bg-orange-500 py-2 text-center text-white font-bold text-lg tracking-wide">
          MAKE MESSAGING GREAT AGAIN!
        </div>
        <CardContent className="pt-6 bg-gradient-to-b from-orange-50 to-white">
          <div className="text-center mb-6">
            <div className="h-20 w-20 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-4 border-4 border-orange-400">
              <FaFrog className="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-orange-600">
              Welcome to Donald Toad Chat
            </h2>
            <p className="text-gray-600 mt-2 font-medium">
              I'm the GREATEST chat assistant ever created! BELIEVE ME! 🐸
            </p>
            <p className="text-gray-500 mt-2">
              Enter your name to start having TREMENDOUS conversations
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="username" className="block text-sm font-bold text-orange-600 mb-1">
                YOUR TREMENDOUS NAME
              </Label>
              <Input 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name (it's gonna be GREAT!)"
                className="w-full px-3 py-2 border-orange-300"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-orange-500 text-white font-bold py-3 px-4 hover:bg-orange-600 transition-colors text-lg uppercase"
              disabled={!username.trim()}
            >
              Start AMAZING Chat!
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
