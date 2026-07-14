import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Pricing = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await api("/payments/checkout", "POST");
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        throw new Error("Stripe checkout URL not returned");
      }
    } catch (err) {
      setError(err.message || "Failed to initiate subscription process.");
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Free Tracker",
      price: "₹0",
      period: "forever",
      desc: "Perfect for starting your financial tracking journey.",
      features: [
        "Personal transaction logging",
        "Basic monthly overview",
        "Join 1 shared household",
        "Basic dark/light mode themes",
      ],
      buttonText: "Current Plan",
      isCurrent: user?.subscriptionStatus !== "pro",
      action: null,
      highlight: false,
    },
    {
      name: "Wealthify Pro",
      price: "₹299",
      period: "month",
      desc: "Unlock advanced insights and collaborative tracking.",
      features: [
        "Everything in Free Tracker",
        "Unlimited personal transactions",
        "Create & Own Shared Households",
        "Administrative member permissions",
        "Premium Recharts visualizations",
        "Priority customer support",
      ],
      buttonText: user?.subscriptionStatus === "pro" ? "Active Subscription" : "Upgrade to Pro",
      isCurrent: user?.subscriptionStatus === "pro",
      action: handleSubscribe,
      highlight: true,
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Simple, Transparent <span className="bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">Pricing</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
          Choose the plan that fits your financial roadmap. Upgrade or cancel anytime.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm max-w-md mx-auto text-center font-medium">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl p-8 flex flex-col justify-between border relative transition-all duration-300 ${
              plan.highlight
                ? "bg-white dark:bg-dark-card border-teal-500/50 dark:border-teal-500/30 shadow-xl shadow-teal-500/5 dark:shadow-none scale-105"
                : "bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border shadow-sm"
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-widest">
                RECOMMENDED
              </span>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.desc}</p>
              </div>

              <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">/{plan.period}</span>
              </div>

              <ul className="space-y-3.5 pt-4 border-t border-slate-100 dark:border-dark-border">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <span className="text-teal-500 mt-0.5 font-bold">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4">
              {plan.action ? (
                <button
                  onClick={plan.action}
                  disabled={loading || plan.isCurrent}
                  className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] ${
                    plan.isCurrent
                      ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-default border border-slate-200 dark:border-dark-border"
                      : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20 hover:opacity-95 disabled:opacity-50"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Redirecting...
                    </span>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              ) : (
                <div
                  className="w-full py-3 rounded-2xl font-semibold text-sm text-center bg-slate-50 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-dark-border cursor-default"
                >
                  {plan.buttonText}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/" className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-500 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Pricing;
