import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Clock, TrendingUp, DollarSign, Package, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useListings } from "@/context/ListingsContext";
import { useBookings } from "@/context/BookingsContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ── mock weekly lending data ── */
const weeklyData = [
  { week: "W1", rentals: 3, earnings: 85 },
  { week: "W2", rentals: 5, earnings: 140 },
  { week: "W3", rentals: 4, earnings: 110 },
  { week: "W4", rentals: 7, earnings: 195 },
  { week: "W5", rentals: 6, earnings: 170 },
  { week: "W6", rentals: 8, earnings: 230 },
  { week: "W7", rentals: 5, earnings: 155 },
  { week: "W8", rentals: 9, earnings: 260 },
  { week: "W9", rentals: 7, earnings: 210 },
  { week: "W10", rentals: 11, earnings: 320 },
  { week: "W11", rentals: 8, earnings: 245 },
  { week: "W12", rentals: 10, earnings: 290 },
];

const completionData = [
  { week: "W1", rate: 85 },
  { week: "W2", rate: 90 },
  { week: "W3", rate: 88 },
  { week: "W4", rate: 92 },
  { week: "W5", rate: 87 },
  { week: "W6", rate: 95 },
  { week: "W7", rate: 91 },
  { week: "W8", rate: 93 },
  { week: "W9", rate: 89 },
  { week: "W10", rate: 96 },
  { week: "W11", rate: 94 },
  { week: "W12", rate: 97 },
];

const PIE_COLORS = [
  "hsl(15, 75%, 55%)",   // primary
  "hsl(38, 85%, 55%)",   // accent
  "hsl(210, 70%, 55%)",  // info
  "hsl(152, 55%, 45%)",  // success
  "hsl(280, 50%, 55%)",
  "hsl(0, 72%, 55%)",    // destructive
];

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { listings } = useListings();
  const { bookings } = useBookings();

  /* derive stats from context */
  const totalListings = listings.length;
  const completedBookings = bookings.filter((b) => b.status === "completed" || b.status === "active").length;
  const totalEarnings = bookings.reduce((sum, b) => sum + b.price, 0);
  const avgDuration = "3.2 days";

  /* category breakdown for pie */
  const categoryMap: Record<string, number> = {};
  listings.forEach((l) => {
    categoryMap[l.category] = (categoryMap[l.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  /* top items by bookings (mock) */
  const topItems = listings.slice(0, 5).map((l, i) => ({
    name: l.title.length > 20 ? l.title.slice(0, 20) + "…" : l.title,
    bookings: [12, 9, 8, 6, 4][i] || 3,
  }));

  /* borrower type (mock) */
  const borrowerData = [
    { name: "Returning", value: 65 },
    { name: "New", value: 35 },
  ];

  const kpis = [
    { icon: Package, label: "Listed Items", value: totalListings, color: "text-primary" },
    { icon: DollarSign, label: "Total Earnings", value: `$${totalEarnings}`, color: "text-success" },
    { icon: TrendingUp, label: "Completed Rentals", value: completedBookings, color: "text-accent" },
    { icon: Clock, label: "Avg. Duration", value: avgDuration, color: "text-info" },
    { icon: Eye, label: "Profile Views", value: 1_248, color: "text-primary" },
    { icon: BarChart3, label: "Completion Rate", value: "94%", color: "text-success" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto min-h-screen max-w-5xl bg-background pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/80 p-4 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-card"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="font-display text-lg font-bold text-foreground">Analytics Dashboard</h1>
      </div>

      <div className="flex flex-col gap-5 px-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="flex flex-col items-center gap-1 rounded-2xl bg-card p-4 shadow-card"
            >
              <kpi.icon size={20} className={kpi.color} />
              <span className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</span>
              <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Earnings by Week */}
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Earnings by Week</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="gradEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38, 85%, 55%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(38, 85%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 90%)" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 50%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 50%)" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(36, 33%, 97%)",
                    border: "1px solid hsl(35, 20%, 90%)",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="hsl(38, 85%, 55%)"
                  strokeWidth={2}
                  fill="url(#gradEarnings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Completion Rate by Week */}
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Completion Rate by Week</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={completionData}>
                <defs>
                  <linearGradient id="gradRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210, 70%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(210, 70%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 90%)" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 50%)" />
                <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 50%)" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(36, 33%, 97%)",
                    border: "1px solid hsl(35, 20%, 90%)",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(210, 70%, 55%)"
                  strokeWidth={2}
                  fill="url(#gradRate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Borrower Type */}
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Borrower Type</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={borrowerData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 50%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 50%)" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(36, 33%, 97%)",
                    border: "1px solid hsl(35, 20%, 90%)",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  <Cell fill="hsl(38, 85%, 55%)" />
                  <Cell fill="hsl(15, 75%, 55%)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Category Breakdown</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  style={{ fontSize: 10 }}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(36, 33%, 97%)",
                    border: "1px solid hsl(35, 20%, 90%)",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Top Items */}
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Top Lent Items</h2>
            <div className="flex flex-col gap-2">
              {topItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-[120px] truncate text-xs text-muted-foreground md:w-[140px]">{item.name}</span>
                  <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary"
                      style={{ width: `${(item.bookings / 12) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-foreground">{item.bookings}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories by Earnings */}
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Earnings by Category</h2>
            <div className="flex flex-col gap-2">
              {[
                { name: "Tech", amount: 520 },
                { name: "Studio", amount: 340 },
                { name: "Vehicles", amount: 280 },
                { name: "Jewellery", amount: 200 },
                { name: "Tools", amount: 150 },
              ].map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-[80px] text-xs text-muted-foreground">{cat.name}</span>
                  <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-accent"
                      style={{ width: `${(cat.amount / 520) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold text-foreground">${cat.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
