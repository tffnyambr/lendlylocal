import { useState } from "react";
import SegmentedControl from "@/components/SegmentedControl";
import { listings } from "@/data/mockData";
import { useBookings } from "@/context/BookingsContext";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Minus, Plus, Trash2, Calendar, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const PurchasesTab = () => {
  const [segment, setSegment] = useState(0);
  const [days, setDays] = useState(3);
  const { bookings } = useBookings();
  const rentalFee = listings[3].price * days;
  const serviceFee = Math.round(rentalFee * 0.1);
  const deposit = 50;

  const activeBookings = bookings.filter((b) => b.status === "active");

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Purchases</h1>
      <SegmentedControl segments={["Cart", "Tracking"]} active={segment} onChange={setSegment} />

      <AnimatePresence mode="wait">
        {segment === 0 ? (
          <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            {/* Cart item */}
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <div className="flex gap-3">
                <img src={listings[3].image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{listings[3].title}</h4>
                      <p className="text-xs text-muted-foreground">${listings[3].price}/day</p>
                    </div>
                    <button className="text-muted-foreground">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Duration</span>
                    <div className="flex items-center gap-2 rounded-full bg-secondary px-2 py-1">
                      <button onClick={() => setDays(Math.max(1, days - 1))} className="text-muted-foreground"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-semibold text-foreground">{days}d</span>
                      <button onClick={() => setDays(days + 1)} className="text-muted-foreground"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <h4 className="mb-3 text-sm font-semibold text-foreground">Price Breakdown</h4>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Rental fee ({days} days)</span><span className="text-foreground">${rentalFee}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span className="text-foreground">${serviceFee}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Security deposit</span><span className="text-foreground">${deposit}</span></div>
                <div className="mt-2 border-t border-border pt-2 flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${rentalFee + serviceFee + deposit}</span>
                </div>
              </div>
            </div>

            <button className="rounded-full bg-primary py-3.5 text-center text-sm font-semibold text-primary-foreground shadow-elevated transition-transform active:scale-[0.98]">
              Secure Checkout
            </button>
          </motion.div>
        ) : (
          <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            {activeBookings.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No active tracking items</p>
            )}

            {activeBookings.map((booking) => (
              <div key={booking.id} className="rounded-2xl bg-card p-4 shadow-card">
                <div className="flex gap-3 mb-4">
                  <img src={booking.itemImage} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <h4 className="text-sm font-semibold text-foreground">{booking.itemTitle}</h4>
                      {booking.isLending ? (
                        <span className="flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
                          <ArrowUpRight size={10} /> Lending
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                          <ArrowDownLeft size={10} /> Renting
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar size={10} />
                      {booking.startDate} – {booking.endDate}
                    </p>
                  </div>
                </div>

                {/* Reminder */}
                <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-3 mb-4">
                  <Clock size={18} className="text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Reminder</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar size={10} />
                      {booking.itemTitle} is due in 2 days
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex flex-col gap-0 ml-2">
                  {[
                    { label: "Booking confirmed", time: booking.startDate, done: true },
                    { label: "Picked up", time: booking.startDate, done: true },
                    { label: "In use", time: "Now", done: true, active: true },
                    { label: "Return", time: booking.endDate, done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${step.active ? "bg-primary ring-4 ring-primary/20" : step.done ? "bg-success" : "bg-muted"}`} />
                        {i < 3 && <div className={`w-0.5 h-8 ${step.done ? "bg-success/40" : "bg-muted"}`} />}
                      </div>
                      <div className="-mt-0.5">
                        <p className={`text-sm ${step.active ? "font-semibold text-primary" : step.done ? "font-medium text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          {step.time !== "Now" && <Calendar size={9} />}
                          {step.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PurchasesTab;
