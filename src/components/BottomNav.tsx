import { Home, MessageCircle, RefreshCw, ShoppingCart, User } from "lucide-react";
import { motion } from "framer-motion";
import { messages } from "@/data/mockData";

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "comms", label: "Messages", icon: MessageCircle },
  { id: "activity", label: "Activity", icon: RefreshCw },
  { id: "purchases", label: "Purchases", icon: ShoppingCart },
  { id: "profile", label: "Profile", icon: User },
] as const;

export type TabId = (typeof tabs)[number]["id"];

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const BottomNav = ({ active, onChange }: BottomNavProps) => {
  const unreadCount = messages.reduce((sum, m) => sum + m.unread, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          const showBadge = tab.id === "comms" && unreadCount > 0;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-2 h-0.5 w-8 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {showBadge && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
