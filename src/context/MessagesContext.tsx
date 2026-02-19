import { createContext, useContext, useState, type ReactNode } from "react";
import { messages as mockMessages, type MessageThread } from "@/data/mockData";

export interface ChatMessage {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
}

interface MessagesContextValue {
  threads: MessageThread[];
  getChat: (userName: string) => ChatMessage[];
  sendMessage: (userName: string, text: string) => void;
  markAsRead: (userName: string) => void;
}

const MessagesContext = createContext<MessagesContextValue | null>(null);

export const useMessages = () => {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
};

const seedChats: Record<string, ChatMessage[]> = {
  "James K.": [
    { id: "c1", sender: "them", text: "Hey, the camera is ready for pickup!", time: "10:30 AM" },
    { id: "c2", sender: "me", text: "Great! What time works best?", time: "10:32 AM" },
    { id: "c3", sender: "them", text: "Sure, you can pick it up at 3pm!", time: "10:33 AM" },
  ],
  "Olivia P.": [
    { id: "c4", sender: "them", text: "Thanks for returning it in great condition 😊", time: "Yesterday" },
  ],
  "Tom H.": [
    { id: "c5", sender: "them", text: "Is the bike still available for next weekend?", time: "3h ago" },
  ],
  "Amara L.": [
    { id: "c6", sender: "them", text: "I'll confirm the booking tonight", time: "1d ago" },
  ],
};

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const [threads, setThreads] = useState<MessageThread[]>([...mockMessages]);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(seedChats);

  const getChat = (userName: string): ChatMessage[] => chats[userName] || [];

  const sendMessage = (userName: string, text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "me",
      text,
      time: timeStr,
    };

    setChats((prev) => ({
      ...prev,
      [userName]: [...(prev[userName] || []), newMsg],
    }));

    setThreads((prev) => {
      const existing = prev.find((t) => t.userName === userName);
      if (existing) {
        return prev
          .map((t) =>
            t.userName === userName ? { ...t, lastMessage: text, time: "now", unread: 0 } : t
          )
          .sort((a, b) => (a.userName === userName ? -1 : b.userName === userName ? 1 : 0));
      }
      return [
        {
          id: `m-${Date.now()}`,
          userName,
          avatar: "",
          lastMessage: text,
          time: "now",
          unread: 0,
        },
        ...prev,
      ];
    });
  };

  const markAsRead = (userName: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.userName === userName ? { ...t, unread: 0 } : t))
    );
  };

  return (
    <MessagesContext.Provider value={{ threads, getChat, sendMessage, markAsRead }}>
      {children}
    </MessagesContext.Provider>
  );
};
