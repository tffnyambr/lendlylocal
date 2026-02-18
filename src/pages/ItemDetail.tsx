import { useParams, useNavigate, Link } from "react-router-dom";
import { useListings } from "@/context/ListingsContext";
import { ArrowLeft, Heart, Share2, Star, MapPin, Calendar, Shield, Clock, ChevronRight, User } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const reviews = [
  { id: 1, user: "Emily R.", rating: 5, date: "Jan 2026", comment: "Excellent condition, exactly as described. Would rent again!" },
  { id: 2, user: "Carlos M.", rating: 4, date: "Dec 2025", comment: "Great item, owner was very responsive and flexible with pickup." },
  { id: 3, user: "Sophie L.", rating: 5, date: "Nov 2025", comment: "Perfect for my weekend trip. Highly recommend this listing." },
];

const availabilitySlots = [
  { label: "This week", available: true },
  { label: "Next week", available: true },
  { label: "Feb 24 – Mar 2", available: false },
  { label: "Mar 3 – Mar 9", available: true },
];

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings } = useListings();
  const item = listings.find((l) => l.id === id);
  const [saved, setSaved] = useState(item?.saved ?? false);

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Item not found</p>
      </div>
    );
  }

  const rentalFee = item.price;
  const serviceFee = Math.round(item.price * 0.12);
  const liabilityFee = Math.round(item.price * 0.5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto min-h-screen max-w-lg bg-background pb-28"
    >
      {/* Hero Image */}
      <div className="relative">
        <img src={item.image} alt={item.title} className="h-80 w-full object-cover" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm">
              <Share2 size={16} className="text-foreground" />
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm"
            >
              <Heart size={16} className={saved ? "fill-primary text-primary" : "text-foreground"} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 pt-4">
        {/* Title & Price */}
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">{item.title}</h1>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="text-lg font-bold text-primary">
              ${item.price}<span className="text-xs font-normal text-muted-foreground">/day</span>
            </span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star size={14} className="fill-accent text-accent" />
              <span className="font-medium">{item.rating}</span>
              <span>({reviews.length} reviews)</span>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={12} />
            <span>{item.location} away</span>
          </div>
        </div>

        {/* Owner */}
        <Link to={`/user/${encodeURIComponent(item.owner)}`} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card transition-colors active:bg-secondary">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <User size={18} className="text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{item.owner}</p>
            <p className="text-xs text-muted-foreground">Usually responds within 1 hour</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </Link>

        {/* About This Item */}
        <section>
          <h2 className="font-display text-base font-semibold text-foreground">About This Item</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This {item.title.toLowerCase()} is available for rent in {item.category} category. 
            The item is in excellent condition and well-maintained by the owner. 
            Perfect for short-term use — save money by renting instead of buying!
          </p>
          <div className="mt-3 flex gap-2">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground capitalize">
              {item.category}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              Excellent condition
            </span>
          </div>
        </section>

        {/* Availability */}
        <section>
          <h2 className="font-display text-base font-semibold text-foreground">Availability</h2>
          <div className="mt-2 flex flex-col gap-2">
            {availabilitySlots.map((slot) => (
              <div
                key={slot.label}
                className="flex items-center justify-between rounded-xl bg-card px-3 py-2.5 shadow-card"
              >
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Calendar size={14} className="text-primary" />
                  <span>{slot.label}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    slot.available
                      ? "bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {slot.available ? "Available" : "Booked"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Price Breakdown */}
        <section>
          <h2 className="font-display text-base font-semibold text-foreground">Price Breakdown</h2>
          <div className="mt-2 flex flex-col gap-2 rounded-2xl bg-card p-3 shadow-card">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rental fee (1 day)</span>
              <span className="text-foreground">${rentalFee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service fee</span>
              <span className="text-foreground">${serviceFee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Liability fee</span>
              <span className="text-foreground">${liabilityFee}</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">${rentalFee + serviceFee + liabilityFee}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">Reviews</h2>
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="fill-accent text-accent" />
              <span className="font-semibold text-foreground">{item.rating}</span>
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl bg-card p-3 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                      <User size={14} className="text-muted-foreground" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{review.user}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={10} />
                    <span>{review.date}</span>
                  </div>
                </div>
                <div className="mt-1.5 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < review.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust & Safety */}
        <section className="rounded-2xl bg-card p-3 shadow-card">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Protected by Lendly</h3>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            All rentals include liability coverage and secure payments. Items are verified by the community.
          </p>
        </section>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-bottom">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div>
            <span className="text-lg font-bold text-primary">${item.price}</span>
            <span className="text-xs text-muted-foreground">/day</span>
          </div>
          <Button className="rounded-full px-6 text-sm font-semibold shadow-card">
            Request to Rent
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ItemDetail;
