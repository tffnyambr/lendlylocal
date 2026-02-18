import type { MessageThread } from "@/data/mockData";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

interface MessageItemProps {
  thread: MessageThread;
}

const MessageItem = ({ thread }: MessageItemProps) => {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-1 py-3 transition-colors active:bg-secondary">
      <Link to={`/user/${encodeURIComponent(thread.userName)}`} className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <User size={20} className="text-muted-foreground" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <Link to={`/user/${encodeURIComponent(thread.userName)}`} className="text-sm font-semibold text-foreground hover:underline">
            {thread.userName}
          </Link>
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
