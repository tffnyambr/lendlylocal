import { useState } from "react";
import SegmentedControl from "@/components/SegmentedControl";
import { bookings, listings } from "@/data/mockData";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, DollarSign, ToggleRight, Star } from "lucide-react";

const ActivityTab = () => {
  const [segment, setSegment] = useState(0);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Activity</h1>
      <SegmentedControl segments={["Renting", "Lending"]} active={segment} onChange={setSegment} />

      <AnimatePresence mode="wait">
        {segment === 0 ? (
          <motion.div key="renting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            {/* Active rental */}
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <div className="flex items-start gap-3">
                <img src={bookings[0].itemImage} alt="" className="h-16 w-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{bookings[0].itemTitle}</h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar size={10} /> Due back: Feb 14</p>
                  <div className="mt-2 flex gap-2">
                    <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-semibold text-success">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming returns */}
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upcoming Returns</h3>
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Canon DSLR Camera</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar size={10} /> Return by Feb 14 — 2 days left</p>
                </div>
              </div>
            </div>

            {/* Review prompt */}
            <div className="rounded-2xl bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <Star size={18} className="text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Leave a review</p>
                  <p className="text-xs text-muted-foreground">Rate your rental of Designer Handbag</p>
                </div>
                <button className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">Review</button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="lending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            {/* Earnings overview */}
            <div className="rounded-2xl bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                  <p className="text-xl font-bold text-foreground">$1,240</p>
                </div>
              </div>
            </div>

            {/* Listed items */}
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Listings</h3>
            {listings.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
                <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">${item.price}/day</p>
                </div>
                <ToggleRight size={24} className="text-success" />
              </div>
            ))}

            {/* Pending request */}
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Requests</h3>
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <div className="flex items-center gap-3">
                <img src={bookings[1].itemImage} alt="" className="h-12 w-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{bookings[1].itemTitle}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">{bookings[1].otherUser} · <Calendar size={10} /> {bookings[1].startDate}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">Accept</button>
                  <button className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive">Decline</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityTab;
