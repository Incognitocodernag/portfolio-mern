import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("wm-cookie-consent");
    if (consent === null) {
      // Show banner after 1.5 seconds delay for better UX
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (status) => {
    localStorage.setItem("wm-cookie-consent", status);
    setShow(false);
    // Dispatch a custom event to notify telemetry scripts immediately
    window.dispatchEvent(new Event("cookieConsentChange"));
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl p-6 z-50 animate-slide-up transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">🍪</span>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cookie Consent</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              We use cookies to maintain your login session and gather lightweight, anonymous analytics to optimize your experience. Read our{" "}
              <Link to="/privacy" className="text-teal-500 hover:underline">
                Privacy Policy
              </Link>{" "}
              for more details.
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 justify-end pt-2">
          <button
            onClick={() => handleConsent("declined")}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => handleConsent("accepted")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md shadow-teal-500/10"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
