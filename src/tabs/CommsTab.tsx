import { useMessages } from "@/context/MessagesContext";
import { Link } from "react-router-dom";
import MessageItem from "@/components/MessageItem";

const CommsTab = () => {
  const { threads } = useMessages();

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Messages</h1>
      <div className="flex flex-col">
        {threads.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">No messages yet</p>
        )}
        {threads.map((m) => (
          <Link key={m.id} to={`/chat/${encodeURIComponent(m.userName)}`}>
            <MessageItem thread={m} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CommsTab;
