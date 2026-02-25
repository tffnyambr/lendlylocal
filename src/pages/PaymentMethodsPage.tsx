import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Plus, Banknote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentMethod {
  id: string;
  brand: "visa" | "mastercard";
  last4: string;
  subtitle?: string;
}

const initialCards: PaymentMethod[] = [
  { id: "1", brand: "visa", last4: "4835", subtitle: "My new one" },
  { id: "2", brand: "mastercard", last4: "9210", subtitle: "Personal" },
  { id: "3", brand: "visa", last4: "1122" },
];

const CardBrandIcon = ({ brand }: { brand: "visa" | "mastercard" }) => {
  if (brand === "visa") {
    return (
      <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[hsl(220,60%,15%)]">
        <span className="text-xs font-bold italic tracking-wider text-[hsl(0,0%,100%)]">VISA</span>
      </div>
    );
  }
  return (
    <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[hsl(220,10%,95%)]">
      <div className="flex -space-x-1.5">
        <div className="h-5 w-5 rounded-full bg-[hsl(0,80%,55%)] opacity-90" />
        <div className="h-5 w-5 rounded-full bg-[hsl(38,90%,55%)] opacity-90" />
      </div>
    </div>
  );
};

const PaymentMethodsPage = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<PaymentMethod[]>(initialCards);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
    toast.success("Payment method removed");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft size={16} /> Back to Profile
      </button>

      <h1 className="font-display text-2xl font-bold text-foreground mb-5">
        Payment Methods
      </h1>

      {/* Saved Cards */}
      <div className="rounded-2xl bg-card shadow-card overflow-hidden">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className={`flex w-full items-center gap-3 px-4 py-3.5 ${
              i < cards.length ? "border-b border-border" : ""
            }`}
          >
            <CardBrandIcon brand={card.brand} />
            <div className="flex-1 text-left">
              <span className="text-sm font-semibold text-foreground">
                •••• {card.last4}
              </span>
              {card.subtitle && (
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              )}
            </div>
            <button
              onClick={() => setDeleteTarget(card.id)}
              className="p-1.5 rounded-lg text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={16} />
            </button>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        ))}

        {/* Cash option */}
        <div className="flex w-full items-center gap-3 px-4 py-3.5">
          <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-success/15">
            <Banknote size={20} className="text-success" />
          </div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-foreground">Cash</span>
            <p className="text-xs text-muted-foreground">Pay in person</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* Add payment method button */}
      <Button
        variant="outline"
        className="mt-5 w-full rounded-full gap-2 border-dashed border-2 border-primary/30 text-primary font-semibold hover:bg-primary/5"
        onClick={() => toast.info("Add payment method coming soon")}
      >
        <Plus size={18} />
        Add payment method
      </Button>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
            <AlertDialogDescription>
              This card will be removed from your saved payment methods.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaymentMethodsPage;
