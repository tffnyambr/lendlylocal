import { createContext, useContext, useState, type ReactNode } from "react";
import { bookings as initialBookings, type BookingItem } from "@/data/mockData";

interface BookingsContextType {
  bookings: BookingItem[];
  addBooking: (booking: Omit<BookingItem, "id">) => void;
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

  return (
    <BookingsContext.Provider value={{ bookings, addBooking }}>
      {children}
    </BookingsContext.Provider>
  );
};

export const useBookings = () => {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error("useBookings must be used within BookingsProvider");
  return ctx;
};
