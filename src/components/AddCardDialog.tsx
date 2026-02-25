import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientSecret: string | null;
  onSuccess: () => void;
}

const CardForm = ({
  clientSecret,
  onSuccess,
  onClose,
}: {
  clientSecret: string;
  onSuccess: () => void;
  onClose: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSaving(true);
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setSaving(false);
      return;
    }

    const { error } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      toast.error(error.message || "Failed to save card");
    } else {
      toast.success("Card saved successfully");
      onSuccess();
      onClose();
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-border bg-secondary/30 p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "hsl(var(--foreground))",
                "::placeholder": { color: "hsl(var(--muted-foreground))" },
              },
              invalid: { color: "hsl(var(--destructive))" },
            },
          }}
        />
      </div>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-full"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 rounded-full"
          disabled={!stripe || saving}
        >
          {saving ? "Saving…" : "Save Card"}
        </Button>
      </div>
    </form>
  );
};

const AddCardDialog = ({
  open,
  onOpenChange,
  clientSecret,
  onSuccess,
}: AddCardDialogProps) => {
  if (!clientSecret) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a card</DialogTitle>
          <DialogDescription>
            Your card details are handled securely by Stripe.
          </DialogDescription>
        </DialogHeader>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CardForm
            clientSecret={clientSecret}
            onSuccess={onSuccess}
            onClose={() => onOpenChange(false)}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default AddCardDialog;
