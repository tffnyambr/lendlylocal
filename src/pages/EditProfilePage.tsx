import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, UserPen, KeyRound, ShieldCheck } from "lucide-react";
import EditPersonalDetails from "@/components/edit-profile/EditPersonalDetails";
import SecuritySettings from "@/components/edit-profile/SecuritySettings";
import PrivacyDataSettings from "@/components/edit-profile/PrivacyDataSettings";

type Section = "menu" | "personal" | "security" | "privacy";

const menuItems = [
  {
    id: "personal" as const,
    icon: UserPen,
    label: "Edit Personal Details",
    description: "Name, email, phone, bio & photo",
  },
  {
    id: "security" as const,
    icon: KeyRound,
    label: "Security Settings",
    description: "Password, 2FA, sessions & deactivation",
  },
  {
    id: "privacy" as const,
    icon: ShieldCheck,
    label: "Privacy & Data Settings",
    description: "Visibility, data sharing & deletion",
  },
];

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("menu");

  if (activeSection === "personal") {
    return (
      <div className="min-h-screen bg-background px-4 py-6 pb-24">
        <EditPersonalDetails onBack={() => setActiveSection("menu")} />
      </div>
    );
  }

  if (activeSection === "security") {
    return (
      <div className="min-h-screen bg-background px-4 py-6 pb-24">
        <SecuritySettings onBack={() => setActiveSection("menu")} />
      </div>
    );
  }

  if (activeSection === "privacy") {
    return (
      <div className="min-h-screen bg-background px-4 py-6 pb-24">
        <PrivacyDataSettings onBack={() => setActiveSection("menu")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft size={16} /> Back to Profile
      </button>

      <h1 className="font-display text-2xl font-bold text-foreground mb-5">Edit Profile</h1>

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

export default EditProfilePage;
