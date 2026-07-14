import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProfilePopup = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const ref = useRef();

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleNav = (path) => { navigate(path); onClose(); };
  const handleLogout = () => { logout(); navigate("/login"); onClose(); };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div
      ref={ref}
      className="absolute bottom-20 left-4 right-4 z-50 rounded-xl border
                 bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border
                 shadow-2xl shadow-black/30 overflow-hidden"
      style={{ animation: "pageEnter 0.2s ease" }}
    >
      {/* User info header */}
      <div className="p-4 border-b border-slate-100 dark:border-dark-border bg-gradient-to-r from-teal-500/10 to-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email || ""}
            </p>
            <span className="inline-block mt-0.5 text-[10px] bg-teal-500/20 text-teal-500 dark:text-teal-400 px-2 py-0.5 rounded-full font-medium">
              Pro Plan
            </span>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="p-2">
        {[
          { icon: "👤", label: "Profile Settings", path: "/settings" },
          { icon: "🏠", label: "Household", path: "/household" },
          { icon: "📊", label: "Analytics", path: "/analytics" },
        ].map(({ icon, label, path }) => (
          <button
            key={path}
            onClick={() => handleNav(path)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                       text-slate-700 dark:text-slate-300 hover:bg-slate-100
                       dark:hover:bg-white/5 transition-colors text-left"
          >
            <span className="text-base">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="p-2 pt-0 border-t border-slate-100 dark:border-dark-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                     text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10
                     transition-colors text-left font-medium"
        >
          <span className="text-base">🚪</span>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePopup;