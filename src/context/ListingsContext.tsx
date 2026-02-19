import { createContext, useContext, useState, type ReactNode } from "react";
import { listings as initialListings, type ListingItem } from "@/data/mockData";

interface ListingsContextType {
  listings: ListingItem[];
  removedListings: ListingItem[];
  addListing: (item: Omit<ListingItem, "id" | "rating" | "saved">) => void;
  removeListing: (id: string) => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<ListingItem[]>(initialListings);
  const [removedListings, setRemovedListings] = useState<ListingItem[]>([]);

  const addListing = (item: Omit<ListingItem, "id" | "rating" | "saved">) => {
    const newItem: ListingItem = {
      ...item,
      id: `user-${Date.now()}`,
      rating: 0,
      saved: false,
    };
    setListings((prev) => [newItem, ...prev]);
  };

  const removeListing = (id: string) => {
    setListings((prev) => {
      const item = prev.find((l) => l.id === id);
      if (item) {
        setRemovedListings((r) => [item, ...r]);
      }
      return prev.filter((l) => l.id !== id);
    });
  };

  return (
    <ListingsContext.Provider value={{ listings, removedListings, addListing, removeListing }}>
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error("useListings must be used within ListingsProvider");
  return ctx;
};
