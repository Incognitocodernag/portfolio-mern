import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api } from "../utils/api";

const Settings = () => {
  const { user, login, token } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const [paymentMsg, setPaymentMsg] = useState("");

  useEffect(() => {
    if (paymentStatus === "success") {
      setPaymentMsg("🎉 Congratulations! Your payment was successful and you are now upgraded to Wealthify Pro.");
      setSearchParams({});
    }
  }, [paymentStatus, setSearchParams]);

  const saveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      // Update locally (you can add a backend route for this later if needed)
      login({ ...user, name: name.trim() }, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg(""); // Clear previous messages

    if (pwForm.newPw !== pwForm.confirm) {
      setPwMsg("❌ New passwords do not match"); 
      return;
    }
    if (pwForm.newPw.length < 6) {
      setPwMsg("❌ Password must be at least 6 characters"); 
      return;
    }

    try {
      setPwMsg("⏳ Updating password...");
      
      // Call the backend route we added earlier
      const response = await api("/auth/password", "PUT", {
        current: pwForm.current,
        newPw: pwForm.newPw
      });

      // Show success message and clear the form
      setPwMsg(`✅ ${response.message}`);
      setPwForm({ current: "", newPw: "", confirm: "" });
      
      // Clear the success message after 3 seconds
      setTimeout(() => setPwMsg(""), 3000);

    } catch (err) {
      // Show error message from the backend (e.g., "Incorrect current password")
      setPwMsg(`❌ ${err.message}`);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account and preferences</p>
      </div>

      {paymentMsg && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-sm font-semibold">
          {paymentMsg}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-5">Profile</h3>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-teal-500/30">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
              user?.subscriptionStatus === "pro" 
                ? "bg-teal-500/20 text-teal-500 dark:text-teal-400" 
                : "bg-slate-200 dark:bg-dark-border text-slate-500 dark:text-slate-400"
            }`}>
              {user?.subscriptionStatus === "pro" ? "Pro Plan" : "Free Plan"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Display Name
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
            <input value={user?.email || ""} disabled
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-100 dark:bg-dark-border text-slate-500 dark:text-slate-500 text-sm cursor-not-allowed" />
          </div>
          <button onClick={saveName} disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all">
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Appearance</h3>
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border">
          <div>
            <p className="font-medium text-slate-900 dark:text-white text-sm">{isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isDark ? "Easy on the eyes at night" : "Clean look for daytime use"}
            </p>
          </div>
          <button onClick={toggleTheme}
            className={`toggle-track ${isDark ? "bg-teal-500" : "bg-slate-300"}`}
            aria-label="Toggle theme">
            <div className={`toggle-thumb ${isDark ? "on" : ""}`}>
              {isDark ? "🌙" : "☀️"}
            </div>
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Change Password</h3>
        
        {pwMsg && (
          <div className={`mb-4 p-3 rounded-lg text-sm border ${pwMsg.includes('✅') ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'}`}>
            {pwMsg}
          </div>
        )}

        <form onSubmit={changePassword} className="space-y-3">
          {[
            { key: "current", label: "Current Password", placeholder: "••••••••" },
            { key: "newPw",   label: "New Password",     placeholder: "Min 6 characters" },
            { key: "confirm", label: "Confirm New Password", placeholder: "••••••••" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">{label}</label>
              <input type="password" placeholder={placeholder}
                value={pwForm[key]} onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))} required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm" />
            </div>
          ))}
          <button type="submit"
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-all">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;