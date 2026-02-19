import { useState } from "react";
import { Link } from "react-router-dom";
import SegmentedControl from "@/components/SegmentedControl";
import { useBookings } from "@/context/BookingsContext";
import { useListings } from "@/context/ListingsContext";
import { useMessages } from "@/context/MessagesContext";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, DollarSign, ToggleRight, Star, Package, AlertTriangle, Clock, User, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { logActivity } from "@/lib/activityLogger";
import type { BookingItem, ListingItem } from "@/data/mockData";
import { MapPin } from "lucide-react";

const ActivityTab = () => {
  const [segment, setSegment] = useState(0);
  const { sendMessage } = useMessages();
  const { listings, removedListings, removeListing, togglePause, pausedIds } = useListings();
  const { bookings } = useBookings();
  const userListings = listings.filter((l) => l.owner === "You");
  const pendingRentals = bookings.filter((b) => b.status === "pending");
  const activeRentals = bookings.filter((b) => b.status === "active");
  const completedRentals = bookings.filter((b) => b.status === "completed");

  // Past lent items (completed bookings from lending perspective)
  const pastLentItems = bookings.filter((b) => b.status === "completed");

  // Rental detail sheet state
  const [detailBooking, setDetailBooking] = useState<BookingItem | null>(null);
  const [detailPerspective, setDetailPerspective] = useState<"renting" | "lending">("renting");

  const openDetail = (booking: BookingItem, perspective: "renting" | "lending") => {
    setDetailBooking(booking);
    setDetailPerspective(perspective);
  };

  // Liability claim dialog state
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimItem, setClaimItem] = useState<typeof bookings[0] | null>(null);
  const [claimAmount, setClaimAmount] = useState("");
  const [claimDescription, setClaimDescription] = useState("");

  // Listing detail sheet state
  const [detailListing, setDetailListing] = useState<ListingItem | null>(null);
  const [removedOpen, setRemovedOpen] = useState(false);

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
              <div key={booking.id} className="cursor-pointer rounded-2xl bg-card p-4 shadow-card transition-colors active:bg-secondary/50" onClick={() => openDetail(booking, "renting")}>
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
                  <div key={booking.id} className="cursor-pointer rounded-2xl bg-card p-4 shadow-card transition-colors active:bg-secondary/50" onClick={() => openDetail(booking, "renting")}>
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

            {/* Past Rented Items */}
            {completedRentals.length > 0 && (
              <>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Past Rented Items</h3>
                {completedRentals.map((booking) => (
                  <div key={booking.id} className="cursor-pointer rounded-2xl bg-card p-4 shadow-card transition-colors active:bg-secondary/50" onClick={() => openDetail(booking, "renting")}>
                    <div className="flex items-start gap-3">
                      <img src={booking.itemImage} alt="" className="h-16 w-16 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">{booking.itemTitle}</h3>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User size={10} /> {booking.otherUser}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar size={10} /> {booking.startDate} – {booking.endDate}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">${booking.price}</span>
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

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
                <div key={item.id} className="cursor-pointer rounded-2xl bg-card p-3 shadow-card transition-colors active:bg-secondary/50" onClick={() => setDetailListing(item)}>
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">${item.price}/day</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); togglePause(item.id); toast.success(pausedIds.has(item.id) ? `${item.title} resumed` : `${item.title} paused`); }} className={`rounded-full px-3 py-1 text-xs font-semibold ${pausedIds.has(item.id) ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{pausedIds.has(item.id) ? "Resume" : "Pause"}</button>
                      <button onClick={(e) => { e.stopPropagation(); removeListing(item.id); toast.success(`${item.title} removed`); }} className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive">Remove</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              listings.slice(0, 3).map((item) => (
                <div key={item.id} className="cursor-pointer rounded-2xl bg-card p-3 shadow-card transition-colors active:bg-secondary/50" onClick={() => setDetailListing(item)}>
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">${item.price}/day</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); togglePause(item.id); toast.success(pausedIds.has(item.id) ? `${item.title} resumed` : `${item.title} paused`); }} className={`rounded-full px-3 py-1 text-xs font-semibold ${pausedIds.has(item.id) ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{pausedIds.has(item.id) ? "Resume" : "Pause"}</button>
                      <button onClick={(e) => { e.stopPropagation(); removeListing(item.id); toast.success(`${item.title} removed`); }} className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive">Remove</button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Pending request */}
            {pendingRentals.length > 0 && (
              <>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Requests</h3>
                {pendingRentals.map((booking) => (
                  <div key={booking.id} className="cursor-pointer rounded-2xl bg-card p-4 shadow-card transition-colors active:bg-secondary/50" onClick={() => openDetail(booking, "lending")}>
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
                  <div key={`past-${booking.id}`} className="cursor-pointer rounded-2xl bg-card p-4 shadow-card transition-colors active:bg-secondary/50" onClick={() => openDetail(booking, "lending")}>
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

            {/* Removed Items */}
            {removedListings.length > 0 && (
              <div>
                <button
                  onClick={() => setRemovedOpen(!removedOpen)}
                  className="flex w-full items-center justify-between py-2"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Removed Items ({removedListings.length})
                  </h3>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform ${removedOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {removedOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-col gap-3 overflow-hidden"
                    >
                      {removedListings.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card opacity-60">
                          <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                            <p className="text-xs text-muted-foreground">${item.price}/day</p>
                          </div>
                          <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-[10px] font-semibold text-destructive">Removed</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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

      {/* Rental Detail Sheet */}
      <Sheet open={!!detailBooking} onOpenChange={(open) => !open && setDetailBooking(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-8">
          {detailBooking && (
            <div className="flex flex-col">
              {/* Hero image */}
              <div className="relative mx-4 overflow-hidden rounded-2xl">
                <img
                  src={detailBooking.itemImage}
                  alt={detailBooking.itemTitle}
                  className="h-48 w-full object-cover"
                />
                <div className="absolute bottom-3 left-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    detailBooking.status === "active" ? "bg-success/90 text-success-foreground" :
                    detailBooking.status === "pending" ? "bg-warning/90 text-warning-foreground" :
                    detailBooking.status === "completed" ? "bg-muted text-muted-foreground" :
                    "bg-destructive/90 text-destructive-foreground"
                  }`}>
                    {detailBooking.status}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="px-6 pt-4">
                <SheetHeader className="text-left">
                  <SheetTitle className="text-lg font-bold text-foreground">
                    {detailBooking.itemTitle}
                  </SheetTitle>
                </SheetHeader>
              </div>

              {/* Details */}
              <div className="mt-4 flex flex-col gap-3 px-6">
                {/* Rented from */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <User size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{detailPerspective === "renting" ? "Rented from" : "Rented by"}</p>
                    <Link
                      to={`/user/${encodeURIComponent(detailBooking.otherUser)}`}
                      className="text-sm font-semibold text-primary hover:underline"
                      onClick={() => setDetailBooking(null)}
                    >
                      {detailBooking.otherUser}
                    </Link>
                  </div>
                </div>

                <Separator />

                {/* Duration */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <Calendar size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Rental period</p>
                    <p className="text-sm font-semibold text-foreground">{detailBooking.startDate} – {detailBooking.endDate}</p>
                  </div>
                </div>

                <Separator />

                {/* Price breakdown */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <DollarSign size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{detailPerspective === "renting" ? "Total paid" : "Earned"}</p>
                    <p className="text-sm font-semibold text-foreground">${detailBooking.price.toFixed(2)}</p>
                  </div>
                </div>

                <Separator />

                {/* Status info */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <Clock size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm font-semibold capitalize text-foreground">{detailBooking.status}</p>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <div className="mt-6 px-6">
                {detailPerspective === "renting" && detailBooking.status === "completed" ? (
                  <Link
                    to={`/item/${listings.find(l => l.title === detailBooking.itemTitle)?.id ?? ""}`}
                    onClick={() => setDetailBooking(null)}
                  >
                    <Button className="w-full" variant="outline">
                      View Listing
                    </Button>
                  </Link>
                ) : (
                  <Link
                    to={`/chat/${encodeURIComponent(detailBooking.otherUser)}`}
                    onClick={() => setDetailBooking(null)}
                  >
                    <Button className="w-full" variant="outline">
                      Message {detailBooking.otherUser}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      {/* Listing Detail Sheet */}
      <Sheet open={!!detailListing} onOpenChange={(open) => !open && setDetailListing(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-8">
          {detailListing && (
            <div className="flex flex-col">
              {/* Hero image */}
              <div className="relative mx-4 overflow-hidden rounded-2xl">
                <img
                  src={detailListing.image}
                  alt={detailListing.title}
                  className="h-48 w-full object-cover"
                />
                <div className="absolute bottom-3 left-3">
                  <span className="rounded-full bg-success/90 px-3 py-1 text-xs font-semibold text-success-foreground">
                    Active Listing
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="px-6 pt-4">
                <SheetHeader className="text-left">
                  <SheetTitle className="text-lg font-bold text-foreground">
                    {detailListing.title}
                  </SheetTitle>
                </SheetHeader>
              </div>

              {/* Details */}
              <div className="mt-4 flex flex-col gap-3 px-6">
                {/* Owner */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <User size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Listed by</p>
                    <p className="text-sm font-semibold text-foreground">You</p>
                  </div>
                </div>

                <Separator />

                {/* Price */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <DollarSign size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Daily rate</p>
                    <p className="text-sm font-semibold text-foreground">${detailListing.price.toFixed(2)}/day</p>
                  </div>
                </div>

                <Separator />

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <Star size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-sm font-semibold text-foreground">{detailListing.rating > 0 ? detailListing.rating : "No ratings yet"}</p>
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <MapPin size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-semibold text-foreground">{detailListing.location}</p>
                  </div>
                </div>

                <Separator />

                {/* Category */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <Package size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-semibold capitalize text-foreground">{detailListing.category}</p>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <div className="mt-6 px-6">
                <Link
                  to={`/item/${detailListing.id}`}
                  onClick={() => setDetailListing(null)}
                >
                  <Button className="w-full" variant="outline">
                    View Listing
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ActivityTab;
