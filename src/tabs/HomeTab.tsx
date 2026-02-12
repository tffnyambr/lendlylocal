import { useState } from "react";
import { Search, SlidersHorizontal, MapPin, Heart, TrendingUp } from "lucide-react";
import SegmentedControl from "@/components/SegmentedControl";
import ItemCard from "@/components/ItemCard";
import { categories, listings } from "@/data/mockData";
import { AnimatePresence, motion } from "framer-motion";
import heroPopular from "@/assets/hero-popular.jpg";

const HomeTab = () => {
  const [segment, setSegment] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = selectedCategory
    ? listings.filter((l) => l.category === selectedCategory)
    : listings;

  const savedItems = listings.filter((l) => l.saved);

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Lendly</h1>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin size={14} className="text-primary" />
          <span>Melbourne</span>
        </div>
      </div>

      {/* Segmented control */}
      <SegmentedControl segments={["Explore", "Saved"]} active={segment} onChange={setSegment} />

      <AnimatePresence mode="wait">
        {segment === 0 ? (
          <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-full bg-secondary px-4 py-2.5">
                <Search size={16} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search items nearby..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-card">
                <SlidersHorizontal size={16} className="text-primary-foreground" />
              </button>
            </div>

            {/* Hero - Popular Items */}
            <div className="relative overflow-hidden rounded-2xl">
              <img src={heroPopular} alt="Popular items" className="h-36 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={14} className="text-primary-foreground" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/80">Trending Now</span>
                </div>
                <h2 className="font-display text-lg font-bold text-primary-foreground leading-tight">Popular Items Near You</h2>
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Masonry grid */}
            <div className="columns-2 gap-3">
              {filtered.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {savedItems.length > 0 ? (
              <div className="columns-2 gap-3">
                {savedItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-20">
                <Heart size={40} className="text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No saved items yet</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeTab;
