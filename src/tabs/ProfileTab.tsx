import { useState, useEffect, useRef } from "react";
import { BadgeCheck, Camera, ChevronRight, CreditCard, HelpCircle, LogOut, Package, Settings, Shield, Star, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const stats = [
  { label: "Earnings", value: "$1,240" },
  { label: "Rentals", value: "12" },
  { label: "Listings", value: "5" },
];

const menuItems = [
  { icon: User, label: "Edit Profile" },
  { icon: CreditCard, label: "Payment Methods" },
  { icon: Shield, label: "ID Verification" },
  { icon: Package, label: "My Listings" },
  { icon: Star, label: "Reviews" },
  { icon: Settings, label: "Settings" },
  { icon: HelpCircle, label: "Help & Support" },
];

const ProfileTab = () => {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email || "User";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        });
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const url = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(url);
      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <div className="flex flex-col gap-5 pb-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />

      {/* Profile card */}
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-6 shadow-card">
        <div className="relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="h-20 w-20">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Profile" />
              ) : null}
              <AvatarFallback className="bg-secondary">
                <User size={32} className="text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera size={20} className="text-white" />
            </div>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </button>
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-success">
            <BadgeCheck size={14} className="text-success-foreground" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={14} className={i <= 4 ? "fill-accent text-accent" : "text-muted"} />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">4.8 (32 reviews)</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center rounded-2xl bg-card p-3 shadow-card">
            <span className="text-lg font-bold text-foreground">{s.value}</span>
            <span className="text-[11px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="rounded-2xl bg-card shadow-card overflow-hidden">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 px-4 py-3.5 transition-colors active:bg-secondary ${
                i < menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <Icon size={18} className="text-muted-foreground" />
              <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <button
        onClick={handleSignOut}
        className="flex items-center justify-center gap-2 rounded-full bg-destructive/10 py-3 text-sm font-semibold text-destructive transition-transform active:scale-[0.98]"
      >
        <LogOut size={16} />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default ProfileTab;
