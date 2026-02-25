import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, BarChart3, Clock, FileWarning } from "lucide-react";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";
import RentalHistory from "@/pages/RentalHistory";
import ClaimsPage from "@/pages/ClaimsPage";

type Section = "menu" | "analytics" | "lending-history" | "claims";

const menuItems = [
  {
    id: "analytics" as const,
    icon: BarChart3,
    label: "Analytics Dashboard",
    description: "Earnings, rentals & performance insights",
  },
  {
    id: "lending-history" as const,
    icon: Clock,
    label: "Lending History",
    description: "Past & current lending records",
  },
  {
    id: "claims" as const,
    icon: FileWarning,
    label: "Claims",
    description: "Damage reports & claim status",
  },
];

const MyListingsPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("menu");

  if (activeSection === "analytics") {
    return <AnalyticsDashboard onBack={() => setActiveSection("menu")} />;
  }

  if (activeSection === "lending-history") {
    return <RentalHistory onBack={() => setActiveSection("menu")} />;
  }

  if (activeSection === "claims") {
    return <ClaimsPage onBack={() => setActiveSection("menu")} />;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft size={16} /> Back to Profile
      </button>

      <h1 className="font-display text-2xl font-bold text-foreground mb-5">My Listings</h1>

      <div className="rounded-2xl bg-card shadow-card overflow-hidden">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex w-full items-center gap-3 px-4 py-4 transition-colors active:bg-secondary ${
                i < menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Icon size={18} className="text-primary" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-sm font-semibold text-foreground">{item.label}</span>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MyListingsPage;
