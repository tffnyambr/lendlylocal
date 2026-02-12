import type { MessageThread } from "@/data/mockData";
import { User } from "lucide-react";

interface MessageItemProps {
  thread: MessageThread;
}

const MessageItem = ({ thread }: MessageItemProps) => {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-1 py-3 transition-colors active:bg-secondary">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <User size={20} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">{thread.userName}</h4>
          <span className="text-[11px] text-muted-foreground">{thread.time}</span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{thread.lastMessage}</p>
      </div>
      {thread.unread > 0 && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <span className="text-[10px] font-bold text-primary-foreground">{thread.unread}</span>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
