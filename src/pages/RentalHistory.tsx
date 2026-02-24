import { useNavigate } from "react-router-dom";
import { useListings } from "@/context/ListingsContext";
import { useBookings } from "@/context/BookingsContext";
import { ArrowLeft, MapPin, Star, Tag, CalendarDays, User, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface RentalRecord {
  date: string;
  sortKey: number;
  listing: {
    id: string;
    title: string;
    image: string;
    price: number;
    rating: number;
    location: string;
    category: string;
    owner: string;
  };
  rental?: {
    renter: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: string;
    isLending?: boolean;
  };
}

const formatDateHeading = (dateStr: string) => dateStr;

const RentalHistory = () => {
  const navigate = useNavigate();
  const { listings } = useListings();
  const { bookings } = useBookings();

  // Build records: combine listings with their booking info, grouped by date
  const records: RentalRecord[] = [];

  // Add all bookings as records
  bookings.forEach((b) => {
    const listing = listings.find((l) => l.title === b.itemTitle);
    records.push({
      date: b.startDate,
      sortKey: parseDateToSort(b.startDate),
      listing: listing
        ? { id: listing.id, title: listing.title, image: listing.image, price: listing.price, rating: listing.rating, location: listing.location, category: listing.category, owner: listing.owner }
        : { id: b.id, title: b.itemTitle, image: b.itemImage, price: b.price, rating: 0, location: "—", category: "—", owner: b.otherUser },
      rental: {
        renter: b.otherUser,
        startDate: b.startDate,
        endDate: b.endDate,
        totalPrice: b.price,
        status: b.status,
        isLending: b.isLending,
      },
    });
  });

  // Add listings without bookings
  listings.forEach((l) => {
    const hasBooking = bookings.some((b) => b.itemTitle === l.title);
    if (!hasBooking) {
      records.push({
        date: "Available",
        sortKey: -1,
        listing: { id: l.id, title: l.title, image: l.image, price: l.price, rating: l.rating, location: l.location, category: l.category, owner: l.owner },
      });
    }
  });

  // Sort descending by date
  records.sort((a, b) => b.sortKey - a.sortKey);

  // Group by date heading
  const grouped: { heading: string; items: RentalRecord[] }[] = [];
  records.forEach((r) => {
    const heading = r.date;
    const existing = grouped.find((g) => g.heading === heading);
    if (existing) existing.items.push(r);
    else grouped.push({ heading, items: [r] });
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto min-h-screen max-w-lg bg-background pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-card"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="font-display text-lg font-bold text-foreground">Lending History</h1>
      </div>

      <div className="flex flex-col gap-6 px-4">
        {grouped.map((group) => (
          <section key={group.heading}>
            <h2 className="mb-3 font-display text-base font-bold text-foreground">{formatDateHeading(group.heading)}</h2>
            <div className="flex flex-col gap-4">
              {group.items.map((record, idx) => (
                <button
                  key={`${record.listing.id}-${idx}`}
                  onClick={() => navigate(`/item/${record.listing.id}`)}
                  className="flex gap-4 rounded-2xl bg-card p-3 shadow-card text-left transition-colors active:bg-secondary"
                >
                  {/* Left: Image */}
                  <img
                    src={record.listing.image}
                    alt={record.listing.title}
                    className="h-28 w-28 flex-shrink-0 rounded-xl object-cover"
                  />

                  {/* Right: Details in two columns */}
                  <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{record.listing.title}</h3>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Tag size={10} className="text-primary" />
                        <span>${record.listing.price}/day</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={10} className="fill-accent text-accent" />
                        <span>{record.listing.rating || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={10} />
                        <span>{record.listing.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={10} />
                        <span className="truncate">{record.listing.owner}</span>
                      </div>

                      {record.rental && (
                        <>
                          <div className="flex items-center gap-1">
                            <CalendarDays size={10} />
                            <span>{record.rental.startDate} – {record.rental.endDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tag size={10} />
                            <span>${record.rental.totalPrice} total</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={10} />
                            <span className="capitalize">{record.rental.status}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${record.rental.isLending ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
                              {record.rental.isLending ? "Lending" : "Renting"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}

        {records.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">No rental history yet.</p>
        )}
      </div>
    </motion.div>
  );
};

function parseDateToSort(dateStr: string): number {
  const months: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
  const parts = dateStr.split(" ");
  if (parts.length === 2) {
    const month = months[parts[0]] || 0;
    const day = parseInt(parts[1]) || 0;
    return month * 100 + day;
  }
  return 0;
}

export default RentalHistory;
