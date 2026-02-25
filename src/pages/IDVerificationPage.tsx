import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Camera, ShieldCheck, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

type IdType = "sa_id" | "passport" | "drivers_license";
type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

const ID_TYPE_LABELS: Record<IdType, string> = {
  sa_id: "South African ID",
  passport: "Passport",
  drivers_license: "Driver's License",
};

const IDVerificationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [idType, setIdType] = useState<IdType>("sa_id");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<VerificationStatus>("unverified");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchStatus = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("verification_status")
        .eq("user_id", user.id)
        .single();

      if (profile?.verification_status) {
        setCurrentStatus(profile.verification_status as VerificationStatus);
      }

      if (profile?.verification_status === "rejected" || profile?.verification_status === "pending") {
        const { data: req } = await supabase
          .from("verification_requests")
          .select("rejection_reason, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (req?.rejection_reason) setRejectionReason(req.rejection_reason);
      }
      setLoading(false);
    };
    fetchStatus();
  }, [user]);

  const handleFileSelect = (file: File, type: "id" | "selfie") => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === "id") {
        setIdFile(file);
        setIdPreview(e.target?.result as string);
      } else {
        setSelfieFile(file);
        setSelfiePreview(e.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user || !idFile || !selfieFile) return;
    setSubmitting(true);
    try {
      const idExt = idFile.name.split(".").pop();
      const selfieExt = selfieFile.name.split(".").pop();
      const idPath = `${user.id}/id-document.${idExt}`;
      const selfiePath = `${user.id}/selfie.${selfieExt}`;

      const [idUpload, selfieUpload] = await Promise.all([
        supabase.storage.from("verification-docs").upload(idPath, idFile, { upsert: true }),
        supabase.storage.from("verification-docs").upload(selfiePath, selfieFile, { upsert: true }),
      ]);

      if (idUpload.error) throw idUpload.error;
      if (selfieUpload.error) throw selfieUpload.error;

      const { error: insertError } = await supabase
        .from("verification_requests")
        .insert({
          user_id: user.id,
          id_document_path: idPath,
          selfie_path: selfiePath,
          id_type: idType,
          status: "pending",
        });

      if (insertError) throw insertError;

      await supabase
        .from("profiles")
        .update({ verification_status: "pending" })
        .eq("user_id", user.id);

      setCurrentStatus("pending");
      toast.success("Verification request submitted!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const statusConfig: Record<VerificationStatus, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
    unverified: { icon: <AlertCircle size={20} />, label: "Not Verified", color: "text-muted-foreground", bg: "bg-muted" },
    pending: { icon: <Clock size={20} />, label: "Pending Review", color: "text-warning", bg: "bg-warning/10" },
    verified: { icon: <CheckCircle2 size={20} />, label: "Verified", color: "text-success", bg: "bg-success/10" },
    rejected: { icon: <XCircle size={20} />, label: "Rejected", color: "text-destructive", bg: "bg-destructive/10" },
  };

  const status = statusConfig[currentStatus];
  const canSubmitNew = currentStatus === "unverified" || currentStatus === "rejected";

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft size={16} /> Back to Profile
      </button>

      <h1 className="font-display text-2xl font-bold text-foreground mb-2">ID Verification</h1>
      <p className="text-sm text-muted-foreground mb-5">Verify your identity to unlock all features.</p>

      {/* Current status banner */}
      <div className={`flex items-center gap-3 rounded-2xl ${status.bg} p-4 mb-5`}>
        <div className={status.color}>{status.icon}</div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>
          {currentStatus === "rejected" && rejectionReason && (
            <p className="text-xs text-muted-foreground mt-0.5">Reason: {rejectionReason}</p>
          )}
          {currentStatus === "pending" && (
            <p className="text-xs text-muted-foreground mt-0.5">Your documents are being reviewed. This usually takes 24-48 hours.</p>
          )}
          {currentStatus === "verified" && (
            <p className="text-xs text-muted-foreground mt-0.5">Your identity has been confirmed.</p>
          )}
        </div>
      </div>

      {canSubmitNew && (
        <AnimatePresence mode="wait">
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`h-0.5 flex-1 rounded transition-colors ${step > s ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Upload ID */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-lg font-semibold text-foreground mb-1">Upload Government ID</h2>
              <p className="text-xs text-muted-foreground mb-4">Upload a clear photo of one of the following documents.</p>

              <div className="flex flex-col gap-2 mb-4">
                {(Object.entries(ID_TYPE_LABELS) as [IdType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setIdType(key)}
                    className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                      idType === key ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <input ref={idInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], "id")} />

              {idPreview ? (
                <div className="relative mb-4">
                  <img src={idPreview} alt="ID Preview" className="w-full rounded-2xl object-cover max-h-56" />
                  <button onClick={() => { setIdFile(null); setIdPreview(null); }} className="absolute top-2 right-2 rounded-full bg-foreground/60 p-1.5">
                    <XCircle size={16} className="text-background" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => idInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-8 transition-colors hover:border-primary/40"
                >
                  <Upload size={28} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Tap to upload your {ID_TYPE_LABELS[idType]}</span>
                  <span className="text-[11px] text-muted-foreground">JPG, PNG — Max 10MB</span>
                </button>
              )}

              <Button onClick={() => setStep(2)} disabled={!idFile} className="w-full mt-4 rounded-xl py-6">
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 2: Selfie */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-lg font-semibold text-foreground mb-1">Take a Selfie</h2>
              <p className="text-xs text-muted-foreground mb-4">Upload a live selfie for facial comparison. Ensure good lighting and your face is clearly visible.</p>

              <input ref={selfieInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], "selfie")} />

              {selfiePreview ? (
                <div className="relative mb-4">
                  <img src={selfiePreview} alt="Selfie Preview" className="w-full rounded-2xl object-cover max-h-56" />
                  <button onClick={() => { setSelfieFile(null); setSelfiePreview(null); }} className="absolute top-2 right-2 rounded-full bg-foreground/60 p-1.5">
                    <XCircle size={16} className="text-background" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => selfieInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-8 transition-colors hover:border-primary/40"
                >
                  <Camera size={28} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Tap to take or upload a selfie</span>
                  <span className="text-[11px] text-muted-foreground">Make sure your face is clearly visible</span>
                </button>
              )}

              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl py-6">Back</Button>
                <Button onClick={() => setStep(3)} disabled={!selfieFile} className="flex-1 rounded-xl py-6">Continue</Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-lg font-semibold text-foreground mb-1">Review & Submit</h2>
              <p className="text-xs text-muted-foreground mb-4">Please review your documents before submitting.</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1.5">Government ID</p>
                  {idPreview && <img src={idPreview} alt="ID" className="w-full rounded-xl object-cover aspect-[4/3]" />}
                  <p className="text-[11px] text-muted-foreground mt-1">{ID_TYPE_LABELS[idType]}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1.5">Selfie</p>
                  {selfiePreview && <img src={selfiePreview} alt="Selfie" className="w-full rounded-xl object-cover aspect-[4/3]" />}
                </div>
              </div>

              <div className="rounded-2xl bg-info/10 p-3 mb-4">
                <p className="text-xs text-info font-medium">Your documents will be securely stored and only accessible by verification administrators.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl py-6">Back</Button>
                <Button onClick={handleSubmit} disabled={submitting} className="flex-1 rounded-xl py-6">
                  {submitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      <ShieldCheck size={16} className="mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default IDVerificationPage;
