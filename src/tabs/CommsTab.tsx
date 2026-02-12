import { useState } from "react";
import SegmentedControl from "@/components/SegmentedControl";
import BookingCard from "@/components/BookingCard";
import MessageItem from "@/components/MessageItem";
import { bookings, messages } from "@/data/mockData";
import { AnimatePresence, motion } from "framer-motion";

const CommsTab = () => {
  const [segment, setSegment] = useState(0);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Comms</h1>
      <SegmentedControl segments={["Bookings", "Messages"]} active={segment} onChange={setSegment} />

      <AnimatePresence mode="wait">
        {segment === 0 ? (
          <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </motion.div>
        ) : (
          <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
            {messages.map((m) => (
              <MessageItem key={m.id} thread={m} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommsTab;
