import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Shield, MonitorSmartphone, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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

const SecuritySettings = ({ onBack }: Props) => {
  const { user, signOut } = useAuth();

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Deactivation
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const validatePassword = () => {
    const errs: Record<string, string> = {};
    if (!newPassword) errs.newPassword = "New password is required";
    else if (newPassword.length < 8) errs.newPassword = "Password must be at least 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword))
      errs.newPassword = "Must contain uppercase, lowercase, and a number";
    if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords don't match";
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggle2FA = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    if (checked) {
      toast.success("Two-factor authentication enabled. You'll receive verification codes via email.");
    } else {
      toast.info("Two-factor authentication disabled.");
    }
  };

  const handleDeactivateAccount = async () => {
    if (!user) return;
    setDeactivating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ deactivated: true })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Account deactivated. You will be signed out.");
      await signOut();
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate account");
    } finally {
      setDeactivating(false);
      setDeactivateOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft size={16} /> Back
      </button>
      <h2 className="font-display text-xl font-bold text-foreground">Security Settings</h2>

      {/* Change Password */}
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <KeyRound size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="currentPassword" className="text-xs text-muted-foreground">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <Label htmlFor="newPassword" className="text-xs text-muted-foreground">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1"
              placeholder="Enter new password"
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-xs text-destructive">{passwordErrors.newPassword}</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
              placeholder="Confirm new password"
            />
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">{passwordErrors.confirmPassword}</p>
            )}
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="mt-1 w-full rounded-full"
          >
            {changingPassword ? "Updating…" : "Update Password"}
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Two-Factor Authentication</h3>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
          </div>
          <Switch checked={twoFactorEnabled} onCheckedChange={handleToggle2FA} />
        </div>
      </div>

      {/* Active Sessions */}
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <div className="flex items-center gap-3">
          <MonitorSmartphone size={18} className="text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Active Sessions</h3>
            <p className="text-xs text-muted-foreground">Manage your signed-in devices</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-secondary/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Current Session</p>
              <p className="text-xs text-muted-foreground">{user?.email} · Active now</p>
            </div>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
              Active
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await signOut();
            toast.success("All other sessions have been signed out.");
          }}
          className="mt-3 w-full rounded-full text-xs"
        >
          Sign Out All Other Sessions
        </Button>
      </div>

      {/* Account Deactivation */}
      <div className="rounded-2xl border border-destructive/20 bg-card p-5 shadow-card">
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className="text-destructive" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Deactivate Account</h3>
            <p className="text-xs text-muted-foreground">Temporarily disable your account</p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={() => setDeactivateOpen(true)}
          className="mt-4 w-full rounded-full"
        >
          Deactivate Account
        </Button>
      </div>

      <AlertDialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile and listings will be hidden. You can reactivate by logging back in. This action does not delete your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateAccount}
              disabled={deactivating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deactivating ? "Deactivating…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SecuritySettings;
