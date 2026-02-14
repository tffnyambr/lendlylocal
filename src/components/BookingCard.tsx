import { Calendar } from "lucide-react";
import type { BookingItem } from "@/data/mockData";

const statusColors: Record<BookingItem["status"], string> = {
  pending: "bg-warning/15 text-warning",
  confirmed: "bg-info/15 text-info",
  active: "bg-success/15 text-success",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

interface BookingCardProps {
  booking: BookingItem;
}

const BookingCard = ({ booking }: BookingCardProps) => {
  return (
    <div className="flex gap-3 rounded-2xl bg-card p-3 shadow-card">
      <img
        src={booking.itemImage}
        alt={booking.itemTitle}
        className="h-20 w-20 rounded-xl object-cover"
      />
      <div className="flex flex-1 flex-col justify-between py-0.5">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{booking.itemTitle}</h4>
          <p className="text-xs text-muted-foreground">with {booking.otherUser}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar size={10} />
              {booking.startDate} – {booking.endDate}
            </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${statusColors[booking.status]}`}>
            {booking.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
