import { useState, useRef } from "react";
import { Plus, X, Camera, Upload, DollarSign, MapPin, Tag, FileText, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { categories } from "@/data/mockData";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const ListItemFAB = () => {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("excellent");
  const [deliveryOption, setDeliveryOption] = useState<"pickup" | "delivery" | "both">("both");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setImages([]);
    setTitle("");
    setDescription("");
    setPrice("");
    setDeposit("");
    setCategory("");
    setLocation("");
    setCondition("excellent");
    setDeliveryOption("both");
  };

  const handleSubmit = () => {
    // Future: submit to backend
    resetForm();
    setOpen(false);
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all";

  const conditions = [
    { value: "excellent", label: "Excellent" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
  ];

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-elevated"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <Plus size={24} className="text-primary-foreground" />
      </motion.button>

      {/* Listing Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-xl">List an Item</DrawerTitle>
            <DrawerDescription>Fill in the details to start lending.</DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
            {/* Image Upload */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-foreground">
                Photos & Videos
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <div key={i} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/60"
                    >
                      <X size={12} className="text-background" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-secondary/30 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Camera size={20} />
                  <span className="text-[10px] font-medium">Add</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Upload up to 10 photos or short videos
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                <FileText size={12} className="mb-0.5 mr-1 inline" />
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Canon DSLR Camera Kit"
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item, its condition, and what's included..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                <Tag size={12} className="mb-0.5 mr-1 inline" />
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      category === cat.id
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

            {/* Price & Deposit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  <DollarSign size={12} className="mb-0.5 mr-1 inline" />
                  Daily Price
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="$0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Deposit
                </label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="$0"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                <MapPin size={12} className="mb-0.5 mr-1 inline" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter suburb or postcode"
                className={inputClass}
              />
            </div>

            {/* Condition */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Condition
              </label>
              <div className="flex gap-2">
                {conditions.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCondition(c.value)}
                    className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${
                      condition === c.value
                        ? "bg-primary text-primary-foreground shadow-card"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Option */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Handover
              </label>
              <div className="flex gap-2">
                {(["pickup", "delivery", "both"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setDeliveryOption(opt)}
                    className={`flex-1 rounded-xl py-2 text-xs font-medium capitalize transition-all ${
                      deliveryOption === opt
                        ? "bg-primary text-primary-foreground shadow-card"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={handleSubmit} className="w-full rounded-xl py-6 text-base font-semibold">
              List Item
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full" onClick={resetForm}>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ListItemFAB;
