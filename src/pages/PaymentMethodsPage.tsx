import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Plus, Banknote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentMethod {
  id: string;
  type: "card" | "cash";
  brand: "visa" | "mastercard" | null;
  last4: string | null;
  subtitle: string | null;
}

const CardBrandIcon = ({ brand }: { brand: "visa" | "mastercard" | null }) => {
  if (brand === "visa") {
    return (
      <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[hsl(220,60%,15%)]">
        <span className="text-xs font-bold italic tracking-wider text-[hsl(0,0%,100%)]">VISA</span>
      </div>
    );
  }
  return (
    <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-secondary">
      <div className="flex -space-x-1.5">
        <div className="h-5 w-5 rounded-full bg-destructive opacity-90" />
        <div className="h-5 w-5 rounded-full bg-accent opacity-90" />
      </div>
    </div>
  );
};

const PaymentMethodsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add form state
  const [cardNumber, setCardNumber] = useState("");
  const [brand, setBrand] = useState<"visa" | "mastercard">("visa");
  const [subtitle, setSubtitle] = useState("");

  const fetchCards = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("payment_methods")
      .select("id, type, brand, last4, subtitle")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Failed to load payment methods");
    } else {
      setCards((data as PaymentMethod[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("payment_methods")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Failed to remove payment method");
    } else {
      setCards((prev) => prev.filter((c) => c.id !== id));
      toast.success("Payment method removed");
    }
    setDeleteTarget(null);
  };

  const handleAdd = async () => {
    if (!user) return;
    const cleaned = cardNumber.replace(/\s/g, "");
    if (cleaned.length < 4) {
      toast.error("Enter at least 4 digits");
      return;
    }
    if (!/^\d+$/.test(cleaned)) {
      toast.error("Card number must contain only digits");
      return;
    }

    setSaving(true);
    const last4 = cleaned.slice(-4);
    const { error } = await supabase.from("payment_methods").insert({
      user_id: user.id,
      type: "card" as const,
      brand,
      last4,
      subtitle: subtitle.trim() || null,
    });

    if (error) {
      toast.error("Failed to add payment method");
    } else {
      toast.success("Payment method added");
      setCardNumber("");
      setSubtitle("");
      setBrand("visa");
      setAddOpen(false);
      fetchCards();
    }
    setSaving(false);
  };

  const handleAddCash = async () => {
    if (!user) return;
    const hasCash = cards.some((c) => c.type === "cash");
    if (hasCash) {
      toast.info("Cash payment already added");
      return;
    }
    const { error } = await supabase.from("payment_methods").insert({
      user_id: user.id,
      type: "cash" as const,
      brand: null,
      last4: null,
      subtitle: "Pay in person",
    });
    if (error) {
      toast.error("Failed to add cash option");
    } else {
      toast.success("Cash payment added");
      fetchCards();
    }
  };

  const cardItems = cards.filter((c) => c.type === "card");
  const cashItem = cards.find((c) => c.type === "cash");

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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-card shadow-card overflow-hidden">
            {cardItems.length === 0 && !cashItem && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No payment methods yet
              </p>
            )}

            {cardItems.map((card, i) => (
              <div
                key={card.id}
                className={`flex w-full items-center gap-3 px-4 py-3.5 ${
                  i < cardItems.length - 1 || cashItem ? "border-b border-border" : ""
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

            {cashItem && (
              <div className="flex w-full items-center gap-3 px-4 py-3.5">
                <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-success/15">
                  <Banknote size={20} className="text-success" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-semibold text-foreground">Cash</span>
                  <p className="text-xs text-muted-foreground">Pay in person</p>
                </div>
                <button
                  onClick={() => setDeleteTarget(cashItem.id)}
                  className="p-1.5 rounded-lg text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={16} />
                </button>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full rounded-full gap-2 border-dashed border-2 border-primary/30 text-primary font-semibold hover:bg-primary/5"
              onClick={() => setAddOpen(true)}
            >
              <Plus size={18} />
              Add card
            </Button>
            {!cashItem && (
              <Button
                variant="outline"
                className="w-full rounded-full gap-2 border-dashed border-2 border-success/30 text-success font-semibold hover:bg-success/5"
                onClick={handleAddCash}
              >
                <Banknote size={18} />
                Add cash payment
              </Button>
            )}
          </div>
        </>
      )}

      {/* Add Card Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-6 pb-8">
          <SheetHeader>
            <SheetTitle className="font-display text-lg font-bold text-foreground">
              Add Card
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Card Number</Label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Card Brand</Label>
              <Select value={brand} onValueChange={(v) => setBrand(v as "visa" | "mastercard")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Label (optional)</Label>
              <Input
                placeholder="e.g. Personal, Work"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                maxLength={50}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={saving || cardNumber.replace(/\s/g, "").length < 4}
              className="mt-2 rounded-full"
            >
              {saving ? "Saving…" : "Add Card"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
            <AlertDialogDescription>
              This payment method will be permanently removed.
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
