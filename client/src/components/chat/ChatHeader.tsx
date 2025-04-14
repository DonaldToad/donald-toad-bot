import { FaFrog } from "react-icons/fa";

interface ChatHeaderProps {
  username: string | null;
}

export default function ChatHeader({ username }: ChatHeaderProps) {
  const initial = username ? username.charAt(0).toUpperCase() : "?";
  
  return (
    <header className="bg-orange-100 shadow-sm py-4 px-6 flex justify-between items-center border-b-4 border-orange-400">
      <div className="flex items-center space-x-3">
        <FaFrog className="text-green-600 text-2xl" />
        <div>
          <h1 className="text-xl font-bold text-orange-600">Donald Toad</h1>
          <p className="text-xs text-green-700">Making the swamp great again!</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700 font-medium">{username}</span>
        <span className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
          {initial}
        </span>
      </div>
    </header>
  );
}
