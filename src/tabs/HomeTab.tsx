import { useState } from "react";
import { Search, SlidersHorizontal, MapPin, Heart, TrendingUp } from "lucide-react";
import SegmentedControl from "@/components/SegmentedControl";
import ItemCard from "@/components/ItemCard";
import FilterSheet, { type FilterState, defaultFilters } from "@/components/FilterSheet";
import { categories } from "@/data/mockData";
import { useListings } from "@/context/ListingsContext";
import { AnimatePresence, motion } from "framer-motion";
import heroPopular from "@/assets/hero-popular.jpg";

const HomeTab = () => {
  const [segment, setSegment] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [minRating, setMinRating] = useState<number | null>(null);
  const { activeListings, listings } = useListings();

  const applyFilters = (f: FilterState) => {
    setFilters(f);
    setSelectedCategory(f.category);
  };

  const filtered = activeListings.filter((l) => {
    if (selectedCategory && l.category !== selectedCategory) return false;
    if (minRating && l.rating <= minRating) return false;
    return true;
  });

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
              <button onClick={() => setFilterOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-card">
                <SlidersHorizontal size={16} className="text-primary-foreground" />
              </button>
            </div>

            {/* Hero - Popular Items */}
            <div
              className="relative overflow-hidden rounded-2xl cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => setMinRating(minRating ? null : 4.5)}
            >
              <img src={heroPopular} alt="Popular items" className="h-36 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={14} className="text-primary-foreground" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/80">Trending Now</span>
                </div>
                <h2 className="font-display text-lg font-bold text-primary-foreground leading-tight">Popular Items Near You</h2>
              </div>
              {minRating && (
                <div className="absolute top-2.5 right-2.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
                  ★ 4.5+
                </div>
              )}
            </div>

            {/* Categories */}
            <h3 className="text-sm font-semibold text-foreground">Browse Categories</h3>
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
      <FilterSheet open={filterOpen} onOpenChange={setFilterOpen} onApply={applyFilters} initialFilters={filters} />
    </div>
  );
};

export default HomeTab;
