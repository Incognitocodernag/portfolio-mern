import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import ProfilePopup from "./ProfilePopup";
import BugReportModal from "./BugReportModal";

const NAV_MAIN = [
  { path: "/", label: "Dashboard",    icon: "⊞" },
  { path: "/transactions", label: "Transactions", icon: "💳" },
  { path: "/analytics", label: "Analytics", icon: "📈" },
  { path: "/ai-assistant", label: "AI Assistant", icon: "✨" },
];

const NAV_ACCOUNT = [
  { path: "/household", label: "Household", icon: "🏠" },
  { path: "/pricing",   label: "Pricing",   icon: "🏷️" },
  { path: "/settings",  label: "Settings",  icon: "⚙️" },
];

const Sidebar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? "bg-teal-500/15 text-teal-400 dark:text-teal-400"
        : "text-slate-500 dark:text-slate-400 hover:bg-white/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
    }`;

  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col
                      bg-white dark:bg-dark-sidebar
                      border-r border-slate-200 dark:border-dark-border z-40">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100 dark:border-dark-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-teal-500/30">
          💰
        </div>
        <span className="font-bold text-slate-900 dark:text-white">
          Wealthify<span className="text-teal-400">Me</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
          Main Menu
        </p>
        {NAV_MAIN.map(({ path, label, icon }) => (
          <NavLink key={path} to={path} end={path === "/"} className={linkClass}>
            <span className="text-base w-5 text-center">{icon}</span>
            {label}
          </NavLink>
        ))}

        <p className="px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-5 mb-2">
          Account
        </p>
        {NAV_ACCOUNT.map(({ path, label, icon }) => (
          <NavLink key={path} to={path} className={linkClass}>
            <span className="text-base w-5 text-center">{icon}</span>
            {label}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => setIsBugModalOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white text-left"
        >
          <span className="text-base w-5 text-center">🚨</span>
          Report a Bug
        </button>
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </span>
          <button
            onClick={toggleTheme}
            className={`toggle-track ${isDark ? "bg-teal-500" : "bg-slate-300"}`}
            aria-label="Toggle theme"
          >
            <div className={`toggle-thumb ${isDark ? "on" : ""}`}>
              {isDark ? "🌙" : "☀️"}
            </div>
          </button>
        </div>
      </div>

      {/* Profile section */}
      <div className="relative px-3 pb-4">
        {showProfile && (
          <ProfilePopup onClose={() => setShowProfile(false)} />
        )}
        <button
          onClick={() => setShowProfile((s) => !s)}
          className="w-full flex items-center gap-3 p-3 rounded-xl
                     hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[11px] text-teal-500 dark:text-teal-400">
              {user?.subscriptionStatus === "pro" ? "Pro Plan" : "Free Plan"}
            </p>
          </div>
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
      <BugReportModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
    </aside>
  );
};

export default Sidebar;