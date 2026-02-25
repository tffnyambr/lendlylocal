import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Eye, Share2, Download, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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

interface Props {
  onBack: () => void;
}

const PrivacyDataSettings = ({ onBack }: Props) => {
  const { user, signOut } = useAuth();
  const [profilePublic, setProfilePublic] = useState(true);
  const [dataSharingEnabled, setDataSharingEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("profile_public, data_sharing_enabled")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfilePublic(data.profile_public ?? true);
          setDataSharingEnabled(data.data_sharing_enabled ?? true);
        }
        setLoading(false);
      });
  }, [user]);

  const updateSetting = async (field: string, value: boolean) => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Setting updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = (checked: boolean) => {
    setProfilePublic(checked);
    updateSetting("profile_public", checked);
  };

  const handleToggleDataSharing = (checked: boolean) => {
    setDataSharingEnabled(checked);
    updateSetting("data_sharing_enabled", checked);
  };

  const handleDownloadData = async () => {
    if (!user) return;
    setDownloading(true);
    try {
      // Fetch user's profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Fetch user's activity log
      const { data: activity } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", user.id);

      const exportData = {
        exportDate: new Date().toISOString(),
        account: {
          email: user.email,
          created_at: user.created_at,
        },
        profile,
        activityLog: activity || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Your data has been downloaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to download data");
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Mark profile as deactivated and clear personal data
      const { error } = await supabase
        .from("profiles")
        .update({
          deactivated: true,
          display_name: "Deleted User",
          avatar_url: null,
          phone: null,
          bio: null,
        })
        .eq("user_id", user.id);
      if (error) throw error;

      toast.success("Account deletion request submitted. You will be signed out.");
      await signOut();
    } catch (err: any) {
      toast.error(err.message || "Failed to request deletion");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft size={16} /> Back
      </button>
      <h2 className="font-display text-xl font-bold text-foreground">Privacy & Data Settings</h2>

      {/* Profile Visibility */}
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye size={18} className="text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Profile Visibility</h3>
              <p className="text-xs text-muted-foreground">
                {profilePublic ? "Your profile is visible to everyone" : "Your profile is hidden"}
              </p>
            </div>
          </div>
          <Switch checked={profilePublic} onCheckedChange={handleToggleVisibility} disabled={saving} />
        </div>
      </div>

      {/* Data Sharing */}
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 size={18} className="text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Data Sharing</h3>
              <p className="text-xs text-muted-foreground">
                {dataSharingEnabled
                  ? "Analytics data is shared to improve the platform"
                  : "No analytics data is shared"}
              </p>
            </div>
          </div>
          <Switch checked={dataSharingEnabled} onCheckedChange={handleToggleDataSharing} disabled={saving} />
        </div>
      </div>

      {/* Download Data */}
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <div className="flex items-center gap-3">
          <Download size={18} className="text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Download Your Data</h3>
            <p className="text-xs text-muted-foreground">Get a copy of all data associated with your account</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleDownloadData}
          disabled={downloading}
          className="mt-4 w-full rounded-full"
        >
          {downloading ? "Preparing…" : "Download My Data"}
        </Button>
      </div>

      {/* Delete Account */}
      <div className="rounded-2xl border border-destructive/20 bg-card p-5 shadow-card">
        <div className="flex items-center gap-3">
          <Trash2 size={18} className="text-destructive" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Delete Account</h3>
            <p className="text-xs text-muted-foreground">
              Permanently remove your account and all associated data
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={() => setDeleteOpen(true)}
          className="mt-4 w-full rounded-full"
        >
          Request Account Deletion
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your profile data will be permanently removed and you will be signed out immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete My Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrivacyDataSettings;
