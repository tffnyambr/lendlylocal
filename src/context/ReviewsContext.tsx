import { createContext, useContext, useState, type ReactNode } from "react";

export interface Review {
  id: string;
  itemId: string;
  user: string;
  rating: number;
  date: string;
  comment: string;
}

const defaultReviews: Review[] = [
  { id: "r1", itemId: "2", user: "Emily R.", rating: 5, date: "Jan 2026", comment: "Excellent condition, exactly as described. Would rent again!" },
  { id: "r2", itemId: "2", user: "Carlos M.", rating: 4, date: "Dec 2025", comment: "Great item, owner was very responsive and flexible with pickup." },
  { id: "r3", itemId: "2", user: "Sophie L.", rating: 5, date: "Nov 2025", comment: "Perfect for my weekend trip. Highly recommend this listing." },
  { id: "r4", itemId: "6", user: "Emily R.", rating: 5, date: "Jan 2026", comment: "Great bike, smooth ride!" },
  { id: "r5", itemId: "5", user: "Carlos M.", rating: 4, date: "Dec 2025", comment: "Beautiful bag, got lots of compliments." },
];

interface ReviewsContextType {
  reviews: Review[];
  addReview: (review: Omit<Review, "id">) => void;
  getReviewsForItem: (itemId: string) => Review[];
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const ReviewsProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>(defaultReviews);

  const addReview = (review: Omit<Review, "id">) => {
    setReviews((prev) => [{ ...review, id: `r-${Date.now()}` }, ...prev]);
  };

  const getReviewsForItem = (itemId: string) => reviews.filter((r) => r.itemId === itemId);

  return (
    <ReviewsContext.Provider value={{ reviews, addReview, getReviewsForItem }}>
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewsProvider");
  return ctx;
};
