import { useState } from "react";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { categories } from "@/data/mockData";

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export interface FilterState {
  category: string | null;
  maxPrice: number;
  maxDistance: number;
  sortBy: "relevance" | "price_low" | "price_high" | "rating" | "distance";
}

export const defaultFilters: FilterState = {
  category: null,
  maxPrice: 100,
  maxDistance: 10,
  sortBy: "relevance",
};

const sortOptions: { value: FilterState["sortBy"]; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price_low", label: "Price: Low → High" },
  { value: "price_high", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
  { value: "distance", label: "Nearest First" },
];

const FilterSheet = ({ open, onOpenChange, onApply, initialFilters }: FilterSheetProps) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    onApply(filters);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-8 pt-4">
        <SheetHeader className="mb-4 flex-row items-center justify-between space-y-0">
          <SheetTitle className="font-display text-lg">Filters</SheetTitle>
          <button onClick={() => onOpenChange(false)} className="rounded-full p-1 text-muted-foreground hover:bg-secondary">
            <X size={18} />
          </button>
        </SheetHeader>

        <div className="flex flex-col gap-6">
          {/* Category */}
          <div>
            <h4 className="mb-2.5 text-sm font-semibold text-foreground">Category</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setFilters((f) => ({ ...f, category: f.category === cat.id ? null : cat.id }))
                  }
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all ${
                    filters.category === cat.id
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Max Price</h4>
              <span className="text-sm font-medium text-primary">${filters.maxPrice}/day</span>
            </div>
            <Slider
              value={[filters.maxPrice]}
              onValueChange={([v]) => setFilters((f) => ({ ...f, maxPrice: v }))}
              min={5}
              max={100}
              step={5}
            />
          </div>

          {/* Distance */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Max Distance</h4>
              <span className="text-sm font-medium text-primary">{filters.maxDistance} km</span>
            </div>
            <Slider
              value={[filters.maxDistance]}
              onValueChange={([v]) => setFilters((f) => ({ ...f, maxDistance: v }))}
              min={1}
              max={50}
              step={1}
            />
          </div>

          {/* Sort */}
          <div>
            <h4 className="mb-2.5 text-sm font-semibold text-foreground">Sort By</h4>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilters((f) => ({ ...f, sortBy: opt.value }))}
                  className={`rounded-full px-3.5 py-2 text-xs font-medium transition-all ${
                    filters.sortBy === opt.value
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleReset}
              className="flex-1 rounded-full border border-border py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground shadow-card transition-colors hover:bg-primary/90"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterSheet;
