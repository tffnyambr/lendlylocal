import { motion } from "framer-motion";

interface SegmentedControlProps {
  segments: string[];
  active: number;
  onChange: (index: number) => void;
}

const SegmentedControl = ({ segments, active, onChange }: SegmentedControlProps) => {
  return (
    <div className="flex gap-1 rounded-full bg-secondary p-1">
      {segments.map((label, i) => (
        <button
          key={label}
          onClick={() => onChange(i)}
          className="relative flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors"
        >
          {active === i && (
            <motion.div
              layoutId="segment-pill"
              className="absolute inset-0 rounded-full bg-card shadow-card"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className={`relative z-10 ${active === i ? "text-foreground" : "text-muted-foreground"}`}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
