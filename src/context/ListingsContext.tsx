import { createContext, useContext, useState, type ReactNode } from "react";
import { listings as initialListings, type ListingItem } from "@/data/mockData";

interface ListingsContextType {
  listings: ListingItem[];
  activeListings: ListingItem[];
  removedListings: ListingItem[];
  pausedIds: Set<string>;
  addListing: (item: Omit<ListingItem, "id" | "rating" | "saved">) => void;
  removeListing: (id: string) => void;
  togglePause: (id: string) => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<ListingItem[]>(initialListings);
  const [removedListings, setRemovedListings] = useState<ListingItem[]>([]);
  const [pausedIds, setPausedIds] = useState<Set<string>>(new Set());

  const activeListings = listings.filter((l) => !pausedIds.has(l.id));

  const togglePause = (id: string) => {
    setPausedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
    <ListingsContext.Provider value={{ listings, activeListings, removedListings, pausedIds, addListing, removeListing, togglePause }}>
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error("useListings must be used within ListingsProvider");
  return ctx;
};
