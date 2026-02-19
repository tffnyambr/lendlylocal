import { BadgeCheck, ChevronRight, CreditCard, HelpCircle, LogOut, Package, Settings, Shield, Star, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <div className="flex flex-col gap-5 pb-4">
      <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>

      {/* Profile card */}
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-6 shadow-card">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <User size={32} className="text-muted-foreground" />
          </div>
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
