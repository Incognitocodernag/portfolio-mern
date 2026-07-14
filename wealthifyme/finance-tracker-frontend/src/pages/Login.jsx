import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await api("/auth/login", "POST", form);
      login(data.user, data.token);
      navigate("/");
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
            💰
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Wealthify<span className="text-teal-400">Me</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back</p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-2xl p-8 border border-slate-200 dark:border-dark-border shadow-xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {[
              { name: "email", label: "Email", type: "email", placeholder: "you@email.com" },
              { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400">
                    {label}
                  </label>
                  {name === "password" && (
                    <Link to="/forgot-password" className="text-xs text-teal-500 hover:text-teal-400 font-medium">
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <input
                  name={name} type={type} placeholder={placeholder}
                  value={form[name]} onChange={handle} required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border
                             bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white
                             placeholder-slate-400 dark:placeholder-slate-600
                             focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400
                             transition-colors"
                />
              </div>
            ))}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500
                         text-white font-semibold hover:opacity-90 active:scale-[0.98]
                         transition-all disabled:opacity-60 mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-teal-500 hover:text-teal-400 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;