import { useParams, useNavigate } from "react-router-dom";
import { useMessages } from "@/context/MessagesContext";
import { ArrowLeft, Send, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const ChatPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(name || "");
  const { getChat, sendMessage } = useMessages();
  const messages = getChat(decodedName);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(decodedName, trimmed);
    setText("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto flex min-h-screen max-w-lg flex-col bg-background"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <button
          onClick={() => navigate(`/user/${encodeURIComponent(decodedName)}`)}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <User size={16} className="text-muted-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">{decodedName}</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-2">
          {messages.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Start a conversation with {decodedName}
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                  msg.sender === "me"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card text-foreground shadow-card rounded-bl-md"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p
                  className={`mt-0.5 text-[10px] ${
                    msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-3 safe-bottom">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPage;
