import { Heart, MapPin, Star } from "lucide-react";
import type { ListingItem } from "@/data/mockData";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ItemCardProps {
  item: ListingItem;
}

const ItemCard = ({ item }: ItemCardProps) => {
  const [saved, setSaved] = useState(item.saved);
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-2xl bg-card shadow-card"
      onClick={() => navigate(`/item/${item.id}`)}
    >
      <div className="relative">
        <img
          src={item.image}
          alt={item.title}
          className="w-full object-cover"
          loading="lazy"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-transform active:scale-90"
        >
          <Heart
            size={16}
            className={saved ? "fill-primary text-primary" : "text-foreground"}
          />
        </button>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold leading-tight text-foreground">{item.title}</h3>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-sm font-bold text-primary">${item.price}<span className="text-xs font-normal text-muted-foreground">/day</span></span>
          <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Star size={12} className="fill-accent text-accent" />
            <span>{item.rating}</span>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin size={10} />
          <span>{item.location}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
