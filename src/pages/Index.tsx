import { useState } from "react";
import BottomNav, { type TabId } from "@/components/BottomNav";
import HomeTab from "@/tabs/HomeTab";
import CommsTab from "@/tabs/CommsTab";
import ActivityTab from "@/tabs/ActivityTab";
import PurchasesTab from "@/tabs/PurchasesTab";
import ProfileTab from "@/tabs/ProfileTab";
import { AnimatePresence, motion } from "framer-motion";

const tabs: Record<TabId, React.FC> = {
  home: HomeTab,
  comms: CommsTab,
  activity: ActivityTab,
  purchases: PurchasesTab,
  profile: ProfileTab,
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  const ActiveComponent = tabs[activeTab];

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background">
      <main className="px-4 pb-24 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Index;
