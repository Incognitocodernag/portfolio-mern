import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);
    try {
      const data = await api("/auth/forgot-password", "POST", { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-dark-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 items-center justify-center text-2xl shadow-lg shadow-teal-500/30 mb-4">
            🔒
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Wealthify<span className="text-teal-400">Me</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Recover your account</p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-2xl p-8 border border-slate-200 dark:border-dark-border shadow-xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Forgot Password</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
              {message}
            </div>
          )}

          {!message && (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email" placeholder="you@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border
                             bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white
                             placeholder-slate-400 dark:placeholder-slate-600
                             focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400
                             transition-colors"
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500
                           text-white font-semibold hover:opacity-90 active:scale-[0.98]
                           transition-all disabled:opacity-60 mt-2"
              >
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Remember your password?{" "}
            <Link to="/login" className="text-teal-500 hover:text-teal-400 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
