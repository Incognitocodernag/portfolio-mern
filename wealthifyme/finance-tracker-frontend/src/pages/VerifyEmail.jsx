import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const effectRan = useRef(false);

  useEffect(() => {
    // Avoid double trigger in React StrictMode
    if (effectRan.current) return;
    effectRan.current = true;

    const verify = async () => {
      if (!token) {
        setStatus("error");
        setError("Verification token is missing.");
        return;
      }

      try {
        const data = await api(`/auth/verify-email/${token}`, "GET");
        // Automatically sign in the user
        login(data.user, data.token);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err.message || "Email verification failed.");
      }
    };

    verify();
  }, [token, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-dark-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 items-center justify-center text-2xl shadow-lg shadow-teal-500/30 mb-4">
            ✉️
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Wealthify<span className="text-teal-400">Me</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Email Verification</p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-2xl p-8 border border-slate-200 dark:border-dark-border shadow-xl text-center">
          {status === "verifying" && (
            <div className="space-y-4">
              <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifying Email...</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Please wait while we confirm your email address.</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-2xl mx-auto border border-emerald-200 dark:border-emerald-500/20">
                ✓
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verification Success!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Your email has been successfully verified. You are now logged in.</p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-500/15 text-rose-500 flex items-center justify-center text-2xl mx-auto border border-rose-200 dark:border-rose-500/20">
                ✕
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verification Failed</h2>
                <p className="text-rose-500 dark:text-rose-400 text-sm">{error}</p>
              </div>
              <Link
                to="/login"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-all text-center"
              >
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
