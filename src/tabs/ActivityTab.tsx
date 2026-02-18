import { useState } from "react";
import { Link } from "react-router-dom";
import SegmentedControl from "@/components/SegmentedControl";
import { useBookings } from "@/context/BookingsContext";
import { useListings } from "@/context/ListingsContext";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, DollarSign, ToggleRight, Star, Package } from "lucide-react";

const ActivityTab = () => {
  const [segment, setSegment] = useState(0);
  const { listings } = useListings();
  const { bookings } = useBookings();
  const userListings = listings.filter((l) => l.owner === "You");
  const pendingRentals = bookings.filter((b) => b.status === "pending");
  const activeRentals = bookings.filter((b) => b.status === "active");
  const completedRentals = bookings.filter((b) => b.status === "completed");

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Activity</h1>
      <SegmentedControl segments={["Renting", "Lending"]} active={segment} onChange={setSegment} />

      <AnimatePresence mode="wait">
        {segment === 0 ? (
          <motion.div key="renting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            {/* Active rentals */}
            {activeRentals.map((booking) => (
              <div key={booking.id} className="rounded-2xl bg-card p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <img src={booking.itemImage} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{booking.itemTitle}</h3>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar size={10} /> {booking.startDate} – {booking.endDate}</p>
                    <div className="mt-2">
                      <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-semibold text-success">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pending rentals */}
            {pendingRentals.length > 0 && (
              <>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Requests</h3>
                {pendingRentals.map((booking) => (
                  <div key={booking.id} className="rounded-2xl bg-card p-4 shadow-card">
                    <div className="flex items-start gap-3">
                      <img src={booking.itemImage} alt="" className="h-16 w-16 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">{booking.itemTitle}</h3>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar size={10} /> {booking.startDate} – {booking.endDate}</p>
                        <div className="mt-2">
                          <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-[10px] font-semibold text-warning">Pending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Review prompt for completed */}
            {completedRentals.map((booking) => (
              <div key={booking.id} className="rounded-2xl bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <Star size={18} className="text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Leave a review</p>
                    <p className="text-xs text-muted-foreground">Rate your rental of {booking.itemTitle}</p>
                  </div>
                  <button className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">Review</button>
                </div>
              </div>
            ))}

            {activeRentals.length === 0 && pendingRentals.length === 0 && completedRentals.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No rental activity yet</p>
            )}
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
            {userListings.length > 0 ? (
              userListings.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
                  <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">${item.price}/day</p>
                  </div>
                  <ToggleRight size={24} className="text-success" />
                </div>
              ))
            ) : (
              listings.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
                  <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">${item.price}/day</p>
                  </div>
                  <ToggleRight size={24} className="text-success" />
                </div>
              ))
            )}

            {/* Pending request */}
            {pendingRentals.length > 0 && (
              <>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Requests</h3>
                {pendingRentals.map((booking) => (
                  <div key={booking.id} className="rounded-2xl bg-card p-4 shadow-card">
                    <div className="flex items-center gap-3">
                      <img src={booking.itemImage} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{booking.itemTitle}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground"><Link to={`/user/${encodeURIComponent(booking.otherUser)}`} className="font-medium text-primary hover:underline">{booking.otherUser}</Link> · <Calendar size={10} /> {booking.startDate}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">Accept</button>
                        <button className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive">Decline</button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityTab;
