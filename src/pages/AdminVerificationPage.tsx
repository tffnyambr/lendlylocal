import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Eye, Clock, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface VerificationRequest {
  id: string;
  user_id: string;
  id_document_path: string;
  selfie_path: string;
  id_type: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  display_name: string | null;
  email: string | null;
}

const ID_TYPE_LABELS: Record<string, string> = {
  sa_id: "South African ID",
  passport: "Passport",
  drivers_license: "Driver's License",
};

const AdminVerificationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [idDocUrl, setIdDocUrl] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const checkAdmin = async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
      if (data) fetchRequests();
      setLoading(false);
    };
    checkAdmin();
  }, [user]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("verification_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load requests");
      return;
    }

    // Fetch display names for each user
    const enriched: VerificationRequest[] = [];
    for (const req of data || []) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", req.user_id)
        .single();
      enriched.push({
        ...req,
        display_name: profile?.display_name || null,
        email: null,
      });
    }
    setRequests(enriched);
  };

  const openReview = async (req: VerificationRequest) => {
    setSelectedRequest(req);
    setRejectionReason("");
    setReviewDialogOpen(true);

    // Get signed URLs for docs
    const [idRes, selfieRes] = await Promise.all([
      supabase.storage.from("verification-docs").createSignedUrl(req.id_document_path, 300),
      supabase.storage.from("verification-docs").createSignedUrl(req.selfie_path, 300),
    ]);
    setIdDocUrl(idRes.data?.signedUrl || null);
    setSelfieUrl(selfieRes.data?.signedUrl || null);
  };

  const handleDecision = async (decision: "verified" | "rejected") => {
    if (!selectedRequest || !user) return;
    if (decision === "rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-verification", {
        body: {
          action: "review",
          request_id: selectedRequest.id,
          decision,
          rejection_reason: decision === "rejected" ? rejectionReason.trim() : null,
          target_user_id: selectedRequest.user_id,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`User ${decision === "verified" ? "approved" : "rejected"} successfully`);
      setReviewDialogOpen(false);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to process decision");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4">
        <ShieldCheck size={40} className="text-muted-foreground" />
        <p className="text-lg font-semibold text-foreground">Access Denied</p>
        <p className="text-sm text-muted-foreground text-center">You don't have admin privileges to view this page.</p>
        <Button variant="outline" onClick={() => navigate("/")} className="mt-2">Go Home</Button>
      </div>
    );
  }

  const filtered = filter === "pending" ? requests.filter((r) => r.status === "pending") : requests;

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      verified: { variant: "default", label: "Verified" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    const cfg = map[status] || { variant: "outline" as const, label: status };
    return <Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Verification Admin</h1>
      <p className="text-sm text-muted-foreground mb-5">{requests.filter((r) => r.status === "pending").length} pending requests</p>

      <div className="flex gap-2 mb-4">
        {(["pending", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
            }`}
          >
            {f === "pending" ? "Pending" : "All Requests"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <CheckCircle2 size={32} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No {filter} requests</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((req) => (
            <button
              key={req.id}
              onClick={() => openReview(req)}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card text-left transition-colors active:bg-secondary"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <User size={18} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{req.display_name || "Unknown User"}</p>
                <p className="text-[11px] text-muted-foreground">{ID_TYPE_LABELS[req.id_type] || req.id_type} · {new Date(req.created_at).toLocaleDateString()}</p>
              </div>
              {statusBadge(req.status)}
            </button>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Review Verification</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedRequest.display_name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{ID_TYPE_LABELS[selectedRequest.id_type]} · Submitted {new Date(selectedRequest.created_at).toLocaleDateString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Government ID</p>
                  {idDocUrl ? (
                    <img src={idDocUrl} alt="ID Document" className="w-full rounded-xl object-cover aspect-[4/3] bg-secondary" />
                  ) : (
                    <div className="w-full rounded-xl aspect-[4/3] bg-secondary animate-pulse" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Selfie</p>
                  {selfieUrl ? (
                    <img src={selfieUrl} alt="Selfie" className="w-full rounded-xl object-cover aspect-[4/3] bg-secondary" />
                  ) : (
                    <div className="w-full rounded-xl aspect-[4/3] bg-secondary animate-pulse" />
                  )}
                </div>
              </div>

              {selectedRequest.status === "pending" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Rejection Reason (required if rejecting)</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. ID photo is blurry, face not visible..."
                      rows={2}
                      className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  <DialogFooter className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleDecision("rejected")}
                      disabled={processing}
                      className="flex-1 rounded-xl"
                    >
                      <XCircle size={14} className="mr-1" /> Reject
                    </Button>
                    <Button
                      onClick={() => handleDecision("verified")}
                      disabled={processing}
                      className="flex-1 rounded-xl"
                    >
                      <CheckCircle2 size={14} className="mr-1" /> Approve
                    </Button>
                  </DialogFooter>
                </>
              )}

              {selectedRequest.status !== "pending" && (
                <div className="flex items-center gap-2">
                  {statusBadge(selectedRequest.status)}
                  {selectedRequest.rejection_reason && (
                    <p className="text-xs text-muted-foreground">Reason: {selectedRequest.rejection_reason}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVerificationPage;
