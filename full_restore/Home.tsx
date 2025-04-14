import { useState, useEffect } from "react";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatContainer from "@/components/chat/ChatContainer";
import MessageInput from "@/components/chat/MessageInput";
import UsernameModal from "@/components/chat/UsernameModal";
import AIProviderSelector, { AIProvider } from "@/components/chat/AIProviderSelector";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { generateChatResponse } from "@/lib/openai";
import { ClientMessage } from "@/lib/types";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('auto');
  const { toast } = useToast();

  // Load username and provider preference from localStorage on initial render
  useEffect(() => {
    const storedUsername = localStorage.getItem("donaldToadUsername");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setShowUsernameModal(true);
    }
    
    // Load provider preference if available
    const storedProvider = localStorage.getItem("donaldToadProvider") as AIProvider | null;
    if (storedProvider && ['auto', 'openai', 'perplexity'].includes(storedProvider)) {
      setSelectedProvider(storedProvider as AIProvider);
    }
  }, []);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      try {
        // Add a temporary typing indicator message
        const typingIndicatorId = Date.now();
        setMessages((prev) => [
          ...prev, 
          {
            id: typingIndicatorId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            userId: null,
            platform: "web",
            status: "typing"
          }
        ]);
        
        // Simulate a slight delay before getting the response to make typing more realistic
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use our client-side function that calls the backend API with the selected provider
        const responseContent = await generateChatResponse(content, selectedProvider);
        
        // Remove the typing indicator and return a formatted message object
        setMessages((prev) => prev.filter(msg => msg.id !== typingIndicatorId));
        
        // Return a formatted message object using our client type
        return {
          id: Date.now(),
          role: "assistant",
          content: responseContent,
          timestamp: new Date(),
          userId: null,
          platform: "web",
          visibleContent: "" // Start with empty visible content for typing animation
        } as ClientMessage;
      } catch (error) {
        // Remove any typing indicators on error
        setMessages((prev) => prev.filter(msg => msg.status !== "typing"));
        throw new Error("Failed to get response from Donald Toad");
      }
    },
    onSuccess: (data: ClientMessage) => {
      setMessages((prev) => [...prev, data]);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to get Donald Toad response: ${error.message}`,
      });
    },
  });

  // Handle username submission
  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
    localStorage.setItem("donaldToadUsername", name);
    setShowUsernameModal(false);
    
    // First add a typing indicator
    const typingIndicator: ClientMessage = {
      id: Date.now(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      userId: null,
      platform: "web",
      status: "typing"
    };
    
    setMessages([typingIndicator]);
    
    // After a short delay, replace with the welcome message
    setTimeout(() => {
      // Add welcome message after username is set
      const welcomeMessage: ClientMessage = {
        id: Date.now(),
        role: "assistant",
        content: `Hello ${name}! I'm Donald Toad, the GREATEST toad in the history of toads, maybe ever! Everyone says so! What can I do for you today? 🐸`,
        timestamp: new Date(),
        userId: null,
        platform: "web",
        visibleContent: "" // Start with empty visible content for typing animation
      };
      
      // Remove typing indicator and add welcome message
      setMessages([welcomeMessage]);
    }, 1500);
  };

  // Handle sending a message
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    // Add user message to chat
    const userMessage: ClientMessage = {
      id: Date.now(),
      role: "user",
      content,
      timestamp: new Date(),
      userId: null,
      platform: "web"
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Send message to API
    sendMessageMutation.mutate(content);
  };
  
  // Handle AI provider selection
  const handleProviderSelect = (provider: AIProvider) => {
    setSelectedProvider(provider);
    localStorage.setItem("donaldToadProvider", provider);
    
    // Notify user about provider change
    toast({
      title: "AI Provider Changed",
      description: provider === 'auto' 
        ? "Using Auto (will try multiple providers)" 
        : `Using ${provider} exclusively`,
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 via-white to-orange-50">
      <ChatHeader username={username} />
      
      <main className="flex-1 p-4 md:px-6 lg:px-8 overflow-hidden flex flex-col max-w-5xl mx-auto w-full">
        <div className="flex justify-end mb-2">
          <AIProviderSelector 
            selectedProvider={selectedProvider} 
            onSelectProvider={handleProviderSelect} 
          />
        </div>

        <ChatContainer 
          messages={messages} 
          isLoading={sendMessageMutation.isPending} 
        />
        
        <MessageInput 
          onSendMessage={handleSendMessage} 
          isLoading={sendMessageMutation.isPending} 
        />
      </main>
      
      {showUsernameModal && (
        <UsernameModal onSubmit={handleUsernameSubmit} />
      )}
    </div>
  );
}
