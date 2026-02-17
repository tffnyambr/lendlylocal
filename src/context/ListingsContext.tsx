import { createContext, useContext, useState, type ReactNode } from "react";
import { listings as initialListings, type ListingItem } from "@/data/mockData";

interface ListingsContextType {
  listings: ListingItem[];
  addListing: (item: Omit<ListingItem, "id" | "rating" | "saved">) => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<ListingItem[]>(initialListings);

  const addListing = (item: Omit<ListingItem, "id" | "rating" | "saved">) => {
    const newItem: ListingItem = {
      ...item,
      id: `user-${Date.now()}`,
      rating: 0,
      saved: false,
    };
    setListings((prev) => [newItem, ...prev]);
  };

  return (
    <ListingsContext.Provider value={{ listings, addListing }}>
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error("useListings must be used within ListingsProvider");
  return ctx;
};
