import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

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

const Transactions = () => {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [scope, setScope] = useState("all"); // 'all', 'personal', 'household'
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: "",
    type: "expense",
    note: "",
    isShared: false,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [suggestedByAI, setSuggestedByAI] = useState(false);

  const suggestCategory = async () => {
    if (!form.note.trim() || form.category) return;
    setAiSuggesting(true);
    try {
      const res = await api("/ai/categorize", "POST", { description: form.note });
      if (res.category && CATEGORIES.includes(res.category)) {
        setForm(f => ({ ...f, category: res.category }));
        setSuggestedByAI(true);
      }
    } catch (err) {
      console.warn("AI category suggestion failed:", err);
    } finally {
      setAiSuggesting(false);
    }
  };


  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api(`/transactions?scope=${scope}`);
      setTxns(d);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    load();
  }, [load]);

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
      setSuggestedByAI(false);
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

  const exportToCSV = () => {
    // 1. Define CSV headers
    const headers = ["Date", "Category", "Type", "Amount (₹)", "Note", "Scope", "Created By"];
    
    // 2. Format filtered transactions into CSV rows
    const rows = filtered.map((t) => [
      new Date(t.date).toLocaleDateString("en-IN"),
      `"${t.category.replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      `"${(t.note || "").replace(/"/g, '""')}"`,
      t.householdId ? "Household Shared" : "Personal",
      t.userId?.name || "Unknown"
    ]);

    // 3. Assemble CSV text
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(","))
    ].join("\n");

    // 4. Create Blob and trigger file download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wealthifyme_transactions_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = txns.filter((t) => {
    const matchType = filter === "all" || t.type === filter;
    const matchSearch =
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (t.note || "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const income = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-7 w-40 bg-slate-200 dark:bg-dark-border rounded-lg" />
            <div className="h-4 w-60 bg-slate-200 dark:bg-dark-border rounded-lg" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-slate-200 dark:bg-dark-border rounded-xl" />
            <div className="h-10 w-36 bg-slate-200 dark:bg-dark-border rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage all your income & expenses</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm disabled:opacity-50"
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-teal-500/20"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Income", value: income, color: "text-teal-500", bg: "bg-teal-500/10" },
          { label: "Total Expenses", value: expense, color: "text-red-400", bg: "bg-red-500/10" },
          {
            label: "Net Balance",
            value: income - expense,
            color: income - expense >= 0 ? "text-teal-500" : "text-red-400",
            bg: "bg-slate-100 dark:bg-dark-border",
          },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl p-4 ${bg} border border-slate-200 dark:border-dark-border`}>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className={`text-xl font-bold mt-1 ${color}`}>₹{Math.abs(value).toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-slate-200 dark:border-dark-border">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">New Transaction</h3>
          <form onSubmit={addTxn}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-dark-border">
                {["expense", "income"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
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
                className="px-3 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm"
              />
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, category: e.target.value }));
                    setSuggestedByAI(false);
                  }}
                  required
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm appearance-none"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                {aiSuggesting && (
                  <span className="absolute right-7 top-3.5 text-xs text-teal-500 animate-pulse" title="AI is predicting category...">
                    🪄
                  </span>
                )}
                {suggestedByAI && !aiSuggesting && (
                  <span className="absolute right-7 top-3.5 text-xs text-teal-400" title="Suggested by AI ✨">
                    ✨
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="Note (optional)"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                onBlur={suggestCategory}
                className="px-3 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm"
              />

              <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg">
                <input
                  type="checkbox"
                  id="isShared"
                  checked={form.isShared}
                  onChange={(e) => setForm((f) => ({ ...f, isShared: e.target.checked }))}
                  className="w-4 h-4 text-teal-600 border-slate-300 dark:border-dark-border rounded focus:ring-teal-500"
                />
                <label
                  htmlFor="isShared"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none"
                >
                  Share in Household 🏠
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {formLoading ? "Adding..." : "Add Transaction"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border shadow-md">
        <div className="p-4 border-b border-slate-100 dark:border-dark-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="🔍  Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm"
          />
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Scope Filter */}
            <div className="flex gap-1 border border-slate-200 dark:border-dark-border p-1 rounded-xl bg-slate-50 dark:bg-dark-bg">
              {[
                { id: "all", label: "All Scope" },
                { id: "personal", label: "Personal Only" },
                { id: "household", label: "Household Shared" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setScope(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    scope === id
                      ? "bg-white dark:bg-dark-card text-teal-600 dark:text-teal-400 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex gap-1">
              {["all", "income", "expense"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    filter === f
                      ? "bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/10"
                      : "text-slate-500 dark:text-slate-400 bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction list */}
        <div className="divide-y divide-slate-100 dark:divide-dark-border">
          {filtered.length === 0 ? (
            <div className="p-10 text-center animate-fade-in">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-slate-500 dark:text-slate-400">No transactions found</p>
            </div>
          ) : (
            filtered.map((t) => (
              <div
                key={t._id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] group transition-colors"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                    t.type === "income" ? "bg-teal-500/15" : "bg-red-500/15"
                  }`}
                >
                  {t.type === "income" ? "📥" : "📤"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{t.category}</p>
                    {t.householdId && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/10">
                        🏠 Shared
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t.note || "No note"} ·{" "}
                    {new Date(t.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {t.householdId && t.userId?.name && (
                      <span className="text-slate-400 dark:text-slate-500 font-medium">
                        {" "}
                        · Added by {t.userId.name}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-sm ${t.type === "income" ? "text-teal-500" : "text-red-400"}`}>
                    {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                      t.type === "income"
                        ? "bg-teal-500/15 text-teal-500 dark:text-teal-400"
                        : "bg-red-500/15 text-red-500 dark:text-red-400"
                    }`}
                  >
                    {t.type}
                  </span>
                  <button
                    onClick={() => deleteTxn(t._id)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center text-red-400 hover:text-red-500 transition-all text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-dark-border">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filtered.length} of {txns.length} transactions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;