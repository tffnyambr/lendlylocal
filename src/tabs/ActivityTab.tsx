import { useState } from "react";
import { Link } from "react-router-dom";
import SegmentedControl from "@/components/SegmentedControl";
import { useBookings } from "@/context/BookingsContext";
import { useListings } from "@/context/ListingsContext";
import { useMessages } from "@/context/MessagesContext";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, DollarSign, ToggleRight, Star, Package, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logActivity } from "@/lib/activityLogger";

const ActivityTab = () => {
  const [segment, setSegment] = useState(0);
  const { sendMessage } = useMessages();
  const { listings } = useListings();
  const { bookings } = useBookings();
  const userListings = listings.filter((l) => l.owner === "You");
  const pendingRentals = bookings.filter((b) => b.status === "pending");
  const activeRentals = bookings.filter((b) => b.status === "active");
  const completedRentals = bookings.filter((b) => b.status === "completed");

  // Past lent items (completed bookings from lending perspective)
  const pastLentItems = bookings.filter((b) => b.status === "completed");

  // Liability claim dialog state
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimItem, setClaimItem] = useState<typeof bookings[0] | null>(null);
  const [claimAmount, setClaimAmount] = useState("");
  const [claimDescription, setClaimDescription] = useState("");

  const handleOpenClaim = (booking: typeof bookings[0]) => {
    setClaimItem(booking);
    setClaimAmount("");
    setClaimDescription("");
    setClaimOpen(true);
  };

  const handleSubmitClaim = () => {
    if (!claimAmount || !claimDescription.trim()) {
      toast.error("Please fill in both the amount and damage description.");
      return;
    }
    // Send automatic message to the renter
    if (claimItem?.otherUser) {
      sendMessage(
        claimItem.otherUser,
        `⚠️ Liability Claim: A damage claim of $${claimAmount} has been submitted for "${claimItem.itemTitle}". Damage description: ${claimDescription}`
      );
    }
    logActivity("liability_claim", {
      item: claimItem?.itemTitle,
      otherUser: claimItem?.otherUser,
      amount: claimAmount,
      description: claimDescription,
    });
    toast.success(`Liability claim of $${claimAmount} submitted for ${claimItem?.itemTitle}`);
    setClaimOpen(false);
  };

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

            {/* Past Lent Items */}
            {pastLentItems.length > 0 && (
              <>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Past Lent Items</h3>
                {pastLentItems.map((booking) => (
                  <div key={`past-${booking.id}`} className="rounded-2xl bg-card p-4 shadow-card">
                    <div className="flex items-center gap-3">
                      <img src={booking.itemImage} alt="" className="h-14 w-14 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground">{booking.itemTitle}</h4>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar size={10} /> {booking.startDate} – {booking.endDate}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">Completed</span>
                      </div>
                      <button
                        onClick={() => handleOpenClaim(booking)}
                        className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
                      >
                        <AlertTriangle size={12} />
                        Claim Liability
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liability Claim Dialog */}
      <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Claim Liability</DialogTitle>
            <DialogDescription>
              Submit a damage claim for <span className="font-semibold text-foreground">{claimItem?.itemTitle}</span> rented by {claimItem?.otherUser}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Claim Amount ($)</label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                min={0}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Damage Description</label>
              <Textarea
                placeholder="Describe the damage in detail..."
                value={claimDescription}
                onChange={(e) => setClaimDescription(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleSubmitClaim} className="w-full">
              Submit Claim
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityTab;
