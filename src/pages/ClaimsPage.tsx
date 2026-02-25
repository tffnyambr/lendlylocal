import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Calendar, DollarSign, MessageSquare, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import itemHandbag from "@/assets/item-handbag.jpg";
import itemCamera from "@/assets/item-camera.jpg";
import itemBike from "@/assets/item-bike.jpg";

interface Claim {
  id: string;
  itemTitle: string;
  itemImage: string;
  renterName: string;
  dateSent: string;
  amount: number;
  description: string;
  replied: boolean;
  replyMessage?: string;
  paid: boolean;
  disputed: boolean;
}

const mockClaims: Claim[] = [
  {
    id: "cl-1",
    itemTitle: "Designer Handbag",
    itemImage: itemHandbag,
    renterName: "Olivia P.",
    dateSent: "Feb 1, 2025",
    amount: 85,
    description: "Zipper on the main compartment is broken and the leather strap has visible scratches from misuse.",
    replied: true,
    replyMessage: "I'm sorry about the damage. I didn't notice the zipper issue until I returned it. I'm willing to pay for repairs.",
    paid: true,
    disputed: false,
  },
  {
    id: "cl-2",
    itemTitle: "Canon DSLR Camera",
    itemImage: itemCamera,
    renterName: "James K.",
    dateSent: "Jan 28, 2025",
    amount: 220,
    description: "Lens mount is misaligned causing autofocus failure. Sensor has visible dust spots from improper handling.",
    replied: true,
    replyMessage: "I disagree with this claim. The camera was already having issues when I rented it.",
    paid: false,
    disputed: false,
  },
  {
    id: "cl-3",
    itemTitle: "Mountain Bike",
    itemImage: itemBike,
    renterName: "Tom H.",
    dateSent: "Jan 15, 2025",
    amount: 150,
    description: "Front wheel rim is bent and the derailleur hanger is cracked. Requires professional repair.",
    replied: false,
    paid: false,
    disputed: false,
  },
];

const ClaimsPage = ({ onBack }: { onBack?: () => void }) => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const displayClaims = claims ?? mockClaims;

  const handleDispute = (claimId: string) => {
    const updated = displayClaims.map((c) =>
      c.id === claimId ? { ...c, disputed: true } : c
    );
    setClaims(updated);
    setSelectedClaim((prev) => (prev?.id === claimId ? { ...prev, disputed: true } : prev));
    toast.success("Dispute has been filed. The renter will be notified.");
  };

  const getStatusColor = (claim: Claim) => {
    if (claim.disputed) return "bg-warning/15 text-warning";
    if (claim.paid) return "bg-success/15 text-success";
    if (claim.replied) return "bg-info/15 text-info";
    return "bg-muted text-muted-foreground";
  };

  const getStatusLabel = (claim: Claim) => {
    if (claim.disputed) return "Disputed";
    if (claim.paid) return "Paid";
    if (claim.replied) return "Replied";
    return "Awaiting Response";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto min-h-screen max-w-lg bg-background pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => onBack ? onBack() : navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-card"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="font-display text-lg font-bold text-foreground">Claims</h1>
      </div>

      {/* Summary */}
      <div className="mx-4 mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-card p-3 shadow-card text-center">
          <p className="text-lg font-bold text-foreground">{displayClaims.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Claims</p>
        </div>
        <div className="rounded-2xl bg-card p-3 shadow-card text-center">
          <p className="text-lg font-bold text-success">{displayClaims.filter((c) => c.paid).length}</p>
          <p className="text-[10px] text-muted-foreground">Paid</p>
        </div>
        <div className="rounded-2xl bg-card p-3 shadow-card text-center">
          <p className="text-lg font-bold text-destructive">{displayClaims.filter((c) => !c.paid).length}</p>
          <p className="text-[10px] text-muted-foreground">Unpaid</p>
        </div>
      </div>

      {/* Claims List */}
      <div className="flex flex-col gap-3 px-4">
        {displayClaims.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No claims sent yet.</p>
        ) : (
          displayClaims.map((claim) => (
            <motion.button
              key={claim.id}
              onClick={() => setSelectedClaim(claim)}
              className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card text-left transition-colors active:bg-secondary/50"
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={claim.itemImage}
                alt={claim.itemTitle}
                className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">{claim.itemTitle}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  Claimed from {claim.renterName}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(claim)}`}>
                    {getStatusLabel(claim)}
                  </span>
                  <span className="text-xs font-semibold text-foreground">${claim.amount}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
            </motion.button>
          ))
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedClaim} onOpenChange={(open) => !open && setSelectedClaim(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
          {selectedClaim && (
            <div className="flex flex-col gap-5 pb-6">
              <SheetHeader>
                <SheetTitle className="font-display text-lg">Claim Details</SheetTitle>
              </SheetHeader>

              {/* Item Info */}
              <div className="flex items-center gap-3">
                <img
                  src={selectedClaim.itemImage}
                  alt={selectedClaim.itemTitle}
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-base font-semibold text-foreground">{selectedClaim.itemTitle}</h3>
                  <p className="text-sm text-muted-foreground">Renter: {selectedClaim.renterName}</p>
                </div>
              </div>

              <Separator />

              {/* Claim Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar size={16} className="mt-0.5 text-primary" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Date Sent</p>
                    <p className="text-sm font-medium text-foreground">{selectedClaim.dateSent}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <DollarSign size={16} className="mt-0.5 text-primary" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Amount Charged</p>
                    <p className="text-sm font-bold text-foreground">${selectedClaim.amount}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MessageSquare size={16} className="mt-0.5 text-primary" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Renter Replied</p>
                    <div className="flex items-center gap-1">
                      {selectedClaim.replied ? (
                        <>
                          <CheckCircle2 size={14} className="text-success" />
                          <span className="text-sm font-medium text-success">Yes</span>
                        </>
                      ) : (
                        <>
                          <Clock size={14} className="text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Awaiting</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  {selectedClaim.paid ? (
                    <CheckCircle2 size={16} className="mt-0.5 text-success" />
                  ) : (
                    <XCircle size={16} className="mt-0.5 text-destructive" />
                  )}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Payment Status</p>
                    <p className={`text-sm font-bold ${selectedClaim.paid ? "text-success" : "text-destructive"}`}>
                      {selectedClaim.paid ? "Paid" : "Unpaid"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Damage Description */}
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Damage Description</p>
                <p className="text-sm text-foreground leading-relaxed">{selectedClaim.description}</p>
              </div>

              {/* Renter Reply */}
              {selectedClaim.replied && selectedClaim.replyMessage && (
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Renter's Response</p>
                  <p className="text-sm text-foreground leading-relaxed">"{selectedClaim.replyMessage}"</p>
                </div>
              )}

              {/* Dispute Status / Button */}
              {selectedClaim.disputed ? (
                <div className="flex items-center gap-2 rounded-xl bg-warning/10 p-3">
                  <AlertTriangle size={16} className="text-warning" />
                  <p className="text-sm font-medium text-warning">Dispute has been filed and is under review.</p>
                </div>
              ) : (
                !selectedClaim.paid && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDispute(selectedClaim.id)}
                  >
                    <AlertTriangle size={16} />
                    File a Dispute
                  </Button>
                )
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default ClaimsPage;
