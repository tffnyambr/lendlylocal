import MessageItem from "@/components/MessageItem";
import { messages } from "@/data/mockData";

const CommsTab = () => {
  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Messages</h1>
      <div className="flex flex-col">
        {messages.map((m) => (
          <MessageItem key={m.id} thread={m} />
        ))}
      </div>
    </div>
  );
};

export default CommsTab;
