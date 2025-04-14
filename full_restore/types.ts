/**
 * Client-side message type for the Donald Toad application
 * This is separate from the server-side Message type in schema.ts
 */
export type ClientMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  userId?: number | null;
  platform?: string;
  status?: "typing" | "complete";
  visibleContent?: string; // For animated typing effect
};