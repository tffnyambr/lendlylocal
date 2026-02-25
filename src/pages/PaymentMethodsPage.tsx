import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Plus, Banknote, Trash2, Star, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AddCardDialog from "@/components/AddCardDialog";
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

interface StripeCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

const brandDisplay: Record<string, string> = {
  visa: "VISA",
  mastercard: "MC",
  amex: "AMEX",
  discover: "DISC",
};

const CardBrandIcon = ({ brand }: { brand: string }) => {
  if (brand === "visa") {
    return (
      <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[hsl(220,60%,15%)]">
        <span className="text-xs font-bold italic tracking-wider text-[hsl(0,0%,100%)]">VISA</span>
      </div>
    );
  }
  if (brand === "mastercard") {
    return (
      <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-secondary">
        <div className="flex -space-x-1.5">
          <div className="h-5 w-5 rounded-full bg-destructive opacity-90" />
          <div className="h-5 w-5 rounded-full bg-accent opacity-90" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-secondary">
      <span className="text-[10px] font-bold text-muted-foreground">
        {brandDisplay[brand] || brand.toUpperCase()}
      </span>
    </div>
  );
};

const PaymentMethodsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cards, setCards] = useState<StripeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [addingCard, setAddingCard] = useState(false);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);

  const callStripe = useCallback(
    async (action: string, extra: Record<string, unknown> = {}) => {
      const { data, error } = await supabase.functions.invoke("stripe-payments", {
        body: { action, ...extra },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    []
  );

  const fetchCards = useCallback(async () => {
    if (!user) return;
    try {
      const data = await callStripe("list-payment-methods");
      setCards(data.cards || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  }, [user, callStripe]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleDelete = async (id: string) => {
    try {
      await callStripe("detach-payment-method", { paymentMethodId: id });
      setCards((prev) => prev.filter((c) => c.id !== id));
      toast.success("Card removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove card");
    }
    setDeleteTarget(null);
  };

  const handleAddCard = async () => {
    setAddingCard(true);
    try {
      const data = await callStripe("create-setup-intent");
      setSetupSecret(data.clientSecret);
      setShowAddCard(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to start card setup");
    } finally {
      setAddingCard(false);
    }
  };

  const handleCardAdded = () => {
    setSetupSecret(null);
    fetchCards();
  };

  const handleSetDefault = async (id: string) => {
    try {
      await callStripe("set-default-payment-method", { paymentMethodId: id });
      setCards((prev) =>
        prev.map((c) => ({ ...c, isDefault: c.id === id }))
      );
      toast.success("Default payment method updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to set default");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft size={16} /> Back to Profile
      </button>

      <h1 className="font-display text-2xl font-bold text-foreground mb-1">
        Payment Methods
      </h1>
      <p className="text-xs text-muted-foreground mb-5">
        Securely managed via Stripe
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-card shadow-card overflow-hidden">
            {cards.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No saved cards yet
              </p>
            ) : (
              cards.map((card, i) => (
                <div
                  key={card.id}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 ${
                    i < cards.length - 1 ? "border-b border-border" : ""
                  } ${card.isDefault ? "bg-primary/5" : ""}`}
                >
                  <CardBrandIcon brand={card.brand} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        •••• {card.last4}
                      </span>
                      {card.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          <BadgeCheck size={10} />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Expires {String(card.expMonth).padStart(2, "0")}/{card.expYear}
                    </p>
                  </div>
                  {!card.isDefault && (
                    <button
                      onClick={() => handleSetDefault(card.id)}
                      className="p-1.5 rounded-lg text-muted-foreground transition-colors hover:text-primary hover:bg-primary/10"
                      title="Set as default"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(card.id)}
                    className="p-1.5 rounded-lg text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              ))
            )}

            {/* Cash option */}
            <div className="flex w-full items-center gap-3 px-4 py-3.5 border-t border-border">
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

          <Button
            variant="outline"
            className="mt-5 w-full rounded-full gap-2 border-dashed border-2 border-primary/30 text-primary font-semibold hover:bg-primary/5"
            onClick={handleAddCard}
            disabled={addingCard}
          >
            <Plus size={18} />
            {addingCard ? "Setting up…" : "Add payment method"}
          </Button>
        </>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove card?</AlertDialogTitle>
            <AlertDialogDescription>
              This card will be detached from your Stripe account.
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

      <AddCardDialog
        open={showAddCard}
        onOpenChange={setShowAddCard}
        clientSecret={setupSecret}
        onSuccess={handleCardAdded}
      />
    </div>
  );
};

export default PaymentMethodsPage;
