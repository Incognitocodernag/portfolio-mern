import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const data = await api("/auth/register", "POST", form);
      setSuccess(data.message || "Registration successful! Please verify your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-dark-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 items-center justify-center text-2xl shadow-lg shadow-teal-500/30 mb-4">
            💰
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Wealthify<span className="text-teal-400">Me</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Start your financial journey</p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-2xl p-8 border border-slate-200 dark:border-dark-border shadow-xl">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-500/10 text-teal-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                📬
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Check Your Email</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {success}
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-teal-500/10"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create Account</h2>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                {[
                  { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
                  { name: "email", label: "Email", type: "email", placeholder: "you@email.com" },
                  { name: "password", label: "Password", type: "password", placeholder: "Min 8 chars: 1 Capital, 1 digit, 1 symbol" },
                ].map(({ name, label, type, placeholder }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      {label}
                    </label>
                    <input
                      name={name} type={type} placeholder={placeholder}
                      value={form[name]} onChange={handle} required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border
                                 bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white
                                 placeholder-slate-400 dark:placeholder-slate-600
                                 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-colors"
                    />
                  </div>
                ))}

                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500
                             text-white font-semibold hover:opacity-90 active:scale-[0.98]
                             transition-all disabled:opacity-60 mt-2"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-teal-500 hover:text-teal-400 font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;