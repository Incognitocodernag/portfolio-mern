import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#0d9488", // Teal
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#f97316", // Orange
  "#eab308", // Yellow
  "#10b981", // Emerald
];

const Analytics = () => {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await api("/transactions");
      setTxns(d);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const income = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  // Monthly data (last 6 months)
  const monthlyData = () => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short" });
      const monthTxns = txns.filter((t) => {
        const td = new Date(t.date);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
      });
      months.push({
        name: label,
        income: monthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: monthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      });
    }
    return months;
  };

  const monthly = monthlyData();

  // Category breakdown
  const catMap = {};
  txns
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
  const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const pieData = cats.map(([cat, amt]) => ({
    name: cat,
    value: amt,
  }));

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-7 w-40 bg-slate-200 dark:bg-dark-border rounded-lg" />
          <div className="h-4 w-60 bg-slate-200 dark:bg-dark-border rounded-lg" />
        </div>
        
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="h-3 w-16 bg-slate-200 dark:bg-dark-border rounded" />
              <div className="h-6 w-24 bg-slate-200 dark:bg-dark-border rounded-lg" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-72 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm" />
          <div className="lg:col-span-2 h-72 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Deep dive into your financial health</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Income",
            val: `₹${income.toLocaleString("en-IN")}`,
            color: "text-teal-500",
            bg: "from-teal-500/10 to-emerald-500/10",
          },
          {
            label: "Total Expenses",
            val: `₹${expense.toLocaleString("en-IN")}`,
            color: "text-rose-500",
            bg: "from-rose-500/10 to-orange-500/10",
          },
          {
            label: "Net Balance",
            val: `₹${Math.abs(balance).toLocaleString("en-IN")}`,
            color: balance >= 0 ? "text-teal-500" : "text-rose-500",
            bg: "from-slate-100 to-slate-100 dark:from-dark-border dark:to-dark-border",
          },
          {
            label: "Savings Rate",
            val: `${savingsRate}%`,
            color: savingsRate >= 20 ? "text-teal-500" : "text-orange-500",
            bg: "from-purple-500/10 to-pink-500/10",
          },
        ].map(({ label, val, color, bg }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${bg} rounded-2xl p-5 border border-slate-200 dark:border-dark-border shadow-sm`}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Monthly Chart */}
        <div className="lg:col-span-3 bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border p-6 shadow-md">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Income vs Expenses</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Last 6 months overview</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                  className="dark:stroke-dark-border"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString("en-IN")}`]}
                  contentStyle={{
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  labelStyle={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (Donut Chart) */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border p-6 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Expense Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">By category</p>
          </div>

          {cats.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-10">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No expense data</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-44 h-44 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                      contentStyle={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                      }}
                      itemStyle={{ fontSize: "11px", color: "#1e293b", fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Scrollable Legend */}
              <div className="flex-1 w-full space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {cats.map(([cat, amt], i) => {
                  const pct = expense > 0 ? Math.round((amt / expense) * 100) : 0;
                  return (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                          {cat}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-right flex-shrink-0 font-mono">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {pct}%
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          ₹{amt.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: "💡",
            title: "Savings Insight",
            desc:
              savingsRate >= 30
                ? "Excellent! You're saving over 30% of income."
                : savingsRate >= 20
                ? "Good savings habit. Try to reach 30%."
                : savingsRate >= 0
                ? "Try to save at least 20% of income."
                : "You're spending more than you earn.",
            color:
              savingsRate >= 20
                ? "border-teal-500/30 bg-teal-500/5"
                : "border-orange-500/30 bg-orange-500/5",
          },
          {
            icon: "📊",
            title: "Transaction Volume",
            desc: `${txns.length} total transactions. ${
              txns.filter((t) => t.type === "income").length
            } income, ${txns.filter((t) => t.type === "expense").length} expenses.`,
            color: "border-blue-500/30 bg-blue-500/5",
          },
          {
            icon: "🏆",
            title: "Top Expense",
            desc: cats[0]
              ? `Your biggest expense category is ${cats[0][0]} at ₹${cats[0][1].toLocaleString("en-IN")}.`
              : "No expenses recorded yet.",
            color: "border-purple-500/30 bg-purple-500/5",
          },
        ].map(({ icon, title, desc, color }) => (
          <div key={title} className={`rounded-2xl p-5 border ${color} shadow-sm`}>
            <p className="text-2xl mb-2">{icon}</p>
            <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{title}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;