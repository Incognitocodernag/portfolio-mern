import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { logTelemetryEvent } from "../utils/telemetry";

const BugReportModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [diagnostics, setDiagnostics] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Gather browser diagnostics when modal opens
  useEffect(() => {
    if (isOpen) {
      // Capture recent console errors if possible
      const getOS = () => {
        const ua = navigator.userAgent;
        if (ua.indexOf("Win") !== -1) return "Windows";
        if (ua.indexOf("Mac") !== -1) return "macOS";
        if (ua.indexOf("Linux") !== -1) return "Linux";
        if (ua.indexOf("Android") !== -1) return "Android";
        if (ua.indexOf("like Mac") !== -1) return "iOS";
        return "Unknown OS";
      };

      const getBrowser = () => {
        const ua = navigator.userAgent;
        if (ua.indexOf("Firefox") !== -1) return "Firefox";
        if (ua.indexOf("SamsungBrowser") !== -1) return "Samsung Browser";
        if (ua.indexOf("Opera") !== -1 || ua.indexOf("OPR") !== -1) return "Opera";
        if (ua.indexOf("Trident") !== -1) return "IE";
        if (ua.indexOf("Edge") !== -1 || ua.indexOf("Edg") !== -1) return "Edge";
        if (ua.indexOf("Chrome") !== -1) return "Chrome";
        if (ua.indexOf("Safari") !== -1) return "Safari";
        return "Unknown Browser";
      };

      setDiagnostics({
        os: getOS(),
        browser: getBrowser(),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });

      // Try to autofill user information from localStorage if logged in
      try {
        const storedUser = localStorage.getItem("wm-user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.name) setName(parsed.name);
          if (parsed.email) setEmail(parsed.email);
        }
      } catch (e) {
        console.warn("Could not autofill user data", e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api("/support/ticket", "POST", {
        name,
        email,
        subject,
        message,
        metadata: diagnostics,
      });

      // Log telemetry event for bug submission
      logTelemetryEvent("bug_report_submitted", { subject });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName("");
        setSubject("");
        setMessage("");
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-dark-border flex justify-between items-center bg-gradient-to-r from-teal-500/10 to-emerald-500/10">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Report a Bug / Support</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Let us know what went wrong, and we'll fix it.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
              ✓
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Ticket Submitted!</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Thank you for your report. Our engineering team has been notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 text-xs rounded-xl border border-red-100 dark:border-red-500/20">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Your Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Transaction form does not submit"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Describe the Issue</label>
              <textarea
                required
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe what actions you took, and what went wrong..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500 transition-colors resize-none"
              ></textarea>
            </div>

            {/* Diagnostics Accordion/Panel */}
            <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-dark-border rounded-xl space-y-2 text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
              <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1">🔍 Automatic Diagnostics:</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
                <div>OS: <span className="text-slate-800 dark:text-slate-200">{diagnostics.os}</span></div>
                <div>Browser: <span className="text-slate-800 dark:text-slate-200">{diagnostics.browser}</span></div>
                <div>Viewport: <span className="text-slate-800 dark:text-slate-200">{diagnostics.viewport}</span></div>
                <div>Route: <span className="text-slate-800 dark:text-slate-200">{diagnostics.url ? new URL(diagnostics.url).pathname : ""}</span></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md shadow-teal-500/10 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BugReportModal;
