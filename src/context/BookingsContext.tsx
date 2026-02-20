import { createContext, useContext, useState, type ReactNode } from "react";
import { bookings as initialBookings, type BookingItem } from "@/data/mockData";

interface BookingsContextType {
  bookings: BookingItem[];
  addBooking: (booking: Omit<BookingItem, "id">) => void;
  acceptBooking: (id: string) => void;
  declineBooking: (id: string) => void;
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export const BookingsProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);

  const addBooking = (booking: Omit<BookingItem, "id">) => {
    const newBooking: BookingItem = {
      ...booking,
      id: `b-${Date.now()}`,
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  const acceptBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "active" as const } : b))
    );
  };

  const declineBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b))
    );
  };

  return (
    <BookingsContext.Provider value={{ bookings, addBooking, acceptBooking, declineBooking }}>
      {children}
    </BookingsContext.Provider>
  );
};

export const useBookings = () => {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error("useBookings must be used within BookingsProvider");
  return ctx;
};
