import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Target,
  Plus,
  Trash2,
  Users,
  AlertTriangle,
  X,
  TrendingUp,
  PlusCircle,
  PiggyBank
} from "lucide-react";

const StatCard = ({ title, value, sub, subColor, icon: Icon, iconColor }) => (
  <div className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-slate-100 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      <span className={`p-2 rounded-xl bg-slate-50 dark:bg-white/5 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </span>
    </div>
    <p className="text-2xl font-bold text-slate-950 dark:text-white">
      {typeof value === "number" ? `₹${value.toLocaleString("en-IN")}` : value}
    </p>
    <p className={`text-xs mt-1 font-medium ${subColor}`}>{sub}</p>
  </div>
);

const CATEGORIES = [
  "Food & Dining",
  "Rent & Housing",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Other",
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [txns, setTxns] = useState([]);
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: "",
    type: "expense",
    note: "",
    isShared: false,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      const d = await api("/transactions");
      setTxns(d);

      // Load active household details if available
      try {
        const hh = await api("/household");
        setHousehold(hh);
      } catch (hhErr) {
        setHousehold(null);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
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

  // Household collective metrics
  const collectiveExpense = txns
    .filter((t) => t.householdId && t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const budget = household?.sharedBudget || 0;
  const budgetPercent = budget > 0 ? Math.min(Math.round((collectiveExpense / budget) * 100), 100) : 0;

  // Category spending for top categories
  const catMap = {};
  txns
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
  const topCats = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const addTxn = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api("/transactions", "POST", {
        ...form,
        amount: parseFloat(form.amount),
      });
      setForm({
        amount: "",
        category: "",
        type: "expense",
        note: "",
        isShared: false,
      });
      setShowForm(false);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const deleteTxn = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api(`/transactions/${id}`, "DELETE");
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  const filtered = filter === "all" ? txns : txns.filter((t) => t.type === filter);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-slate-200 dark:bg-dark-border rounded-lg" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-dark-border rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-dark-border rounded-xl" />
        </div>

        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 space-y-4 shadow-sm"
            >
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-slate-200 dark:bg-dark-border rounded" />
                <div className="h-6 w-6 bg-slate-200 dark:bg-dark-border rounded" />
              </div>
              <div className="h-6 w-24 bg-slate-200 dark:bg-dark-border rounded-lg" />
              <div className="h-3 w-32 bg-slate-200 dark:bg-dark-border rounded" />
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 shadow-sm" />
          <div className="h-80 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Good {now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening"},{" "}
            {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Here's your financial overview for today</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">{dateStr}</span>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Budget Limit Warning Alerts */}
      {household && budgetPercent >= 80 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 flex items-start gap-3 shadow-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Budget Threshold Alert</h4>
            <p className="text-xs mt-0.5 leading-relaxed">
              Your shared budget for <strong>{household.name}</strong> has reached <strong>{budgetPercent}%</strong> of its monthly limit! 
              You have spent ₹{collectiveExpense.toLocaleString("en-IN")} of your shared budget limit of ₹{budget.toLocaleString("en-IN")}. 
              Consider delaying non-essential purchases.
            </p>
          </div>
        </div>
      )}

      {/* Quick Add Form */}
      {showForm && (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-slate-200 dark:border-dark-border shadow-lg animate-scale-in">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Add Transaction</h3>
          <form onSubmit={addTxn}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
              {/* Type toggle */}
              <div className="col-span-2 sm:col-span-1 flex rounded-xl overflow-hidden border border-slate-200 dark:border-dark-border">
                {["expense", "income"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
                      form.type === t
                        ? t === "expense"
                          ? "bg-red-500 text-white"
                          : "bg-teal-500 text-white"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Amount (₹)"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                required
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm"
              />
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                required
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm"
              >
                <option value="">Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Note (optional)"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm"
              />
              <div className="col-span-2 sm:col-span-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg">
                <input
                  type="checkbox"
                  id="dashIsShared"
                  checked={form.isShared}
                  onChange={(e) => setForm((f) => ({ ...f, isShared: e.target.checked }))}
                  className="w-4 h-4 text-teal-600 border-slate-300 dark:border-dark-border rounded focus:ring-teal-500"
                />
                <label
                  htmlFor="dashIsShared"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none flex items-center gap-1"
                >
                  Shared <Users className="w-3.5 h-3.5" />
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {formLoading ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Balance"
          value={balance}
          icon={Wallet}
          iconColor="text-teal-600 dark:text-teal-400"
          sub={balance >= 0 ? "▲ Positive balance" : "▼ Negative balance"}
          subColor={balance >= 0 ? "text-teal-500" : "text-red-500"}
        />
        <StatCard
          title="Total Income"
          value={income}
          icon={ArrowDownLeft}
          iconColor="text-blue-600 dark:text-blue-400"
          sub={`▲ ${txns.filter((t) => t.type === "income").length} income entries`}
          subColor="text-blue-500"
        />
        <StatCard
          title="Total Expenses"
          value={expense}
          icon={ArrowUpRight}
          iconColor="text-rose-600 dark:text-rose-400"
          sub={`▲ ${txns.filter((t) => t.type === "expense").length} expense entries`}
          subColor="text-orange-500"
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate}%`}
          icon={Target}
          iconColor="text-purple-600 dark:text-purple-400"
          sub={savingsRate >= 20 ? "▲ Great savings habit!" : savingsRate >= 0 ? "▲ On track" : "▼ Overspending"}
          subColor={savingsRate >= 20 ? "text-teal-500" : savingsRate >= 0 ? "text-orange-500" : "text-red-500"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{txns.length} total transactions</p>
            </div>
            <div className="flex gap-1">
              {["all", "income", "expense"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                    filter === f
                      ? "bg-teal-500 text-white"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-dark-border max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">No transactions yet</div>
            ) : (
              filtered.slice(0, 8).map((t) => (
                <div
                  key={t._id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 group transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      t.type === "income" ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {t.type === "income" ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{t.category}</p>
                      {t.householdId && (
                        <span className="text-[9px] bg-teal-50 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-1">
                          <Users className="w-2.5 h-2.5" /> Shared
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.note || "—"} · {new Date(t.date).toLocaleDateString("en-IN")}
                      {t.householdId && t.userId?.name && ` · ${t.userId.name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-sm font-bold ${t.type === "income" ? "text-teal-600 dark:text-teal-400" : "text-rose-500"}`}>
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                    </span>
                    <button
                      onClick={() => deleteTxn(t._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Widgets Stack */}
        <div className="space-y-6">
          {/* Shared Budget Widget */}
          {household ? (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border p-5 bg-gradient-to-br from-teal-500/[0.02] to-emerald-500/[0.02] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-teal-500" /> {household.name} Budget
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {household.members.length} members sharing
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    budgetPercent > 85
                      ? "bg-red-500/15 text-red-500"
                      : budgetPercent > 70
                      ? "bg-amber-500/15 text-amber-500"
                      : "bg-teal-500/15 text-teal-600 dark:text-teal-400"
                  }`}
                >
                  {budgetPercent}% Spent
                </span>
              </div>
              <div className="space-y-3">
                <div className="h-3 rounded-full bg-slate-100 dark:bg-dark-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      budgetPercent > 85
                        ? "bg-red-500"
                        : budgetPercent > 70
                        ? "bg-amber-500"
                        : "bg-gradient-to-r from-teal-500 to-emerald-500"
                    }`}
                    style={{ width: `${budgetPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 pt-1">
                  <span>Spent: ₹{collectiveExpense.toLocaleString("en-IN")}</span>
                  <span>Limit: ₹{budget.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border p-5 border-dashed flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-teal-500 mb-2">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Collaborate on Budgets</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Invite household members or roommates to track collective expenditures and coordinate shared budgets.
              </p>
              <button
                onClick={() => navigate("/household")}
                className="mt-4 w-full py-2.5 text-center rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-dark-border text-xs text-teal-600 dark:text-teal-400 hover:bg-slate-100 dark:hover:bg-white/10 font-bold transition-all"
              >
                Setup Household
              </button>
            </div>
          )}

          {/* Top Categories */}
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-150 dark:border-dark-border p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Top Expenses</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">By category</p>
            {topCats.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">No expenses yet</p>
            ) : (
              <div className="space-y-4">
                {topCats.map(([cat, amt]) => {
                  const pct = expense > 0 ? Math.round((amt / expense) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{cat}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-dark-border overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        ₹{amt.toLocaleString("en-IN")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;