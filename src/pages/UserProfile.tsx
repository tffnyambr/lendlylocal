import { useParams, useNavigate, Link } from "react-router-dom";
import { useListings } from "@/context/ListingsContext";
import { ArrowLeft, Star, MapPin, Calendar, Shield, User, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const mockUserProfiles: Record<string, { bio: string; memberSince: string; rating: number; reviewCount: number; rentals: number; responseTime: string }> = {
  "Sarah M.": { bio: "Photography enthusiast sharing gear I don't use every day. Happy to help fellow creatives!", memberSince: "2023", rating: 4.9, reviewCount: 28, rentals: 45, responseTime: "< 1 hour" },
  "James K.": { bio: "Tech lover with too many gadgets. Rent my stuff so it gets the love it deserves.", memberSince: "2024", rating: 4.8, reviewCount: 19, rentals: 32, responseTime: "< 30 min" },
  "Amara L.": { bio: "Jewellery collector. Everything is well-maintained and insured.", memberSince: "2024", rating: 5.0, reviewCount: 12, rentals: 18, responseTime: "< 2 hours" },
  "Mike R.": { bio: "Drone pilot and aerial photography pro. Happy to give tips on flying!", memberSince: "2023", rating: 4.7, reviewCount: 22, rentals: 38, responseTime: "< 1 hour" },
  "Olivia P.": { bio: "Fashion lover sharing designer pieces for special occasions.", memberSince: "2024", rating: 4.6, reviewCount: 15, rentals: 24, responseTime: "< 3 hours" },
  "Tom H.": { bio: "Outdoor adventure gear for rent. Bikes, camping, you name it.", memberSince: "2023", rating: 4.5, reviewCount: 31, rentals: 52, responseTime: "< 1 hour" },
  "Dave C.": { bio: "DIY enthusiast with a full workshop. Why buy tools you'll use once?", memberSince: "2024", rating: 4.8, reviewCount: 17, rentals: 29, responseTime: "< 2 hours" },
  "Lisa N.": { bio: "Music and audio gear for events and parties.", memberSince: "2025", rating: 4.4, reviewCount: 8, rentals: 11, responseTime: "< 4 hours" },
};

const mockReviews = [
  { user: "Emily R.", rating: 5, date: "Jan 2026", comment: "Great lender, item was exactly as described!" },
  { user: "Carlos M.", rating: 4, date: "Dec 2025", comment: "Very responsive and flexible with timing." },
  { user: "Sophie L.", rating: 5, date: "Nov 2025", comment: "Would definitely rent from them again." },
];

const defaultProfile = { bio: "Lendly member sharing great items with the community.", memberSince: "2025", rating: 4.5, reviewCount: 5, rentals: 8, responseTime: "< 2 hours" };

const UserProfile = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { listings } = useListings();

  const decodedName = decodeURIComponent(name || "");
  const profile = mockUserProfiles[decodedName] || defaultProfile;
  const userListings = listings.filter((l) => l.owner === decodedName);

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
        <h1 className="font-display text-lg font-bold text-foreground">Profile</h1>
      </div>

      <div className="flex flex-col gap-5 px-4">
        {/* Profile Card */}
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-6 shadow-card">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <User size={32} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">{decodedName}</h2>
            <p className="text-xs text-muted-foreground">Member since {profile.memberSince}</p>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={14} className={i <= Math.round(profile.rating) ? "fill-accent text-accent" : "text-muted"} />
            ))}
            <span className="ml-1 text-xs text-muted-foreground">{profile.rating} ({profile.reviewCount} reviews)</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">{profile.bio}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-2xl bg-card p-3 shadow-card">
            <span className="text-lg font-bold text-foreground">{profile.rentals}</span>
            <span className="text-[11px] text-muted-foreground">Rentals</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-card p-3 shadow-card">
            <span className="text-lg font-bold text-foreground">{profile.reviewCount}</span>
            <span className="text-[11px] text-muted-foreground">Reviews</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-card p-3 shadow-card">
            <span className="text-lg font-bold text-foreground">{profile.responseTime}</span>
            <span className="text-[11px] text-muted-foreground">Response</span>
          </div>
        </div>

        {/* Message Button */}
        <Button variant="outline" className="w-full rounded-full gap-2" asChild>
          <Link to={`/chat/${encodeURIComponent(decodedName)}`}>
            <MessageCircle size={16} />
            Message {decodedName.split(" ")[0]}
          </Link>
        </Button>

        {/* Listings */}
        {userListings.length > 0 && (
          <section>
            <h2 className="font-display text-base font-semibold text-foreground">{decodedName.split(" ")[0]}'s Listings</h2>
            <div className="mt-2 flex flex-col gap-2">
              {userListings.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/item/${item.id}`)}
                  className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card text-left transition-colors active:bg-secondary"
                >
                  <img src={item.image} alt={item.title} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">${item.price}/day</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star size={12} className="fill-accent text-accent" />
                    <span>{item.rating}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section>
          <h2 className="font-display text-base font-semibold text-foreground">Reviews</h2>
          <div className="mt-2 flex flex-col gap-3">
            {mockReviews.map((review, idx) => (
              <div key={idx} className="rounded-2xl bg-card p-3 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{review.user}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={10} />
                    <span>{review.date}</span>
                  </div>
                </div>
                <div className="mt-1.5 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < review.rating ? "fill-accent text-accent" : "text-muted-foreground/30"} />
                  ))}
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="rounded-2xl bg-card p-3 shadow-card">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Verified Member</h3>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            This user's identity has been verified. All transactions are protected by Lendly.
          </p>
        </section>
      </div>
    </motion.div>
  );
};

export default UserProfile;
