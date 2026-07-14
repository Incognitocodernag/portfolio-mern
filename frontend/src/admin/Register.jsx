import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../config';
import ThemeToggle from '../components/ThemeToggle';
import { UserPlus, User, Lock, Loader2, ShieldCheck, ArrowRight, Eye, EyeOff, HelpCircle } from 'lucide-react';

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your first school?",
  "What is your favorite book?",
  "What is the name of your favorite movie?",
  "What was your childhood nickname?",
  "In what city did your parents meet?",
  "What is the name of the street you grew up on?",
  "Who was your childhood hero?"
];

function Register() {
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '',
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if an admin is already registered in the database
    const checkAdminStatus = async () => {
      try {
        const response = await API.get('/auth/status');
        setAdminExists(response.data.adminInitialized);
      } catch (err) {
        console.error('Error fetching admin status:', err);
        setAdminExists(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkAdminStatus();
  }, []);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (credentials.securityAnswer.trim().length < 2) {
      setError('Please provide a valid security answer.');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/register', credentials);
      setSuccess(response.data.message || 'Registration successful! Redirecting...');
      setCredentials({ 
        username: '', 
        password: '', 
        confirmPassword: '',
        securityQuestion: SECURITY_QUESTIONS[0],
        securityAnswer: ''
      });
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#02050E] flex items-center justify-center text-orange-500 transition-colors duration-300">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#02050E] relative p-6 overflow-hidden transition-colors duration-300">
      {/* Floating Theme Toggle top-right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Decorative Orbs */}
      <div className="glow-bg bg-orange-500/10 dark:bg-orange-500/10 top-[-80px] left-[-80px] transition-all duration-300"></div>
      <div className="glow-bg bg-indigo-500/10 dark:bg-indigo-500/10 bottom-[-80px] right-[-80px] transition-all duration-300"></div>

      <div className="w-full max-w-[460px] rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050914]/80 p-8 shadow-2xl backdrop-blur-md relative z-10 transition-colors duration-300">
        
        {adminExists ? (
          // Admin Already Registered Flow
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 text-2xl mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-slate-900 dark:text-white text-2xl font-extrabold tracking-tight">Access Locked</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              An administrator profile has already been initialized in the system. To register additional admin accounts, please log in with your primary credentials first.
            </p>
            <button
              onClick={() => navigate('/admin/login')}
              className="mt-8 w-full py-4 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-600 transition-colors duration-300 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // Registration Form Flow
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-2xl mx-auto mb-4">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight font-sans">Initialize Admin</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">Create the initial administrator account</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 dark:text-rose-400 text-sm font-semibold mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-sm font-semibold mb-6">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Username */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Username</span>
                </label>
                <input 
                  type="text" 
                  name="username" 
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Username" 
                  className="px-4 py-2.5 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300 text-sm"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    required
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="••••••••" 
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Confirm Password</span>
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    required
                    value={credentials.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••" 
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Security Question Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Security Recovery Question</span>
                </label>
                <select
                  name="securityQuestion"
                  value={credentials.securityQuestion}
                  onChange={handleChange}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 transition-all duration-300"
                >
                  {SECURITY_QUESTIONS.map((q, idx) => (
                    <option key={idx} value={q} className="bg-white dark:bg-[#050914] text-slate-900 dark:text-white">
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              {/* Security Answer */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Security Recovery Answer</span>
                </label>
                <input 
                  type="text" 
                  name="securityAnswer" 
                  required
                  value={credentials.securityAnswer}
                  onChange={handleChange}
                  placeholder="Recovery answer (case-insensitive)" 
                  className="px-4 py-2.5 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300 text-sm"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-snug">
                  *This will be used to recover your account if you forget your password. Keep this safe and private!
                </span>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-600 transition-colors duration-300 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 text-sm"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>Initialize Admin</span>
              </button>
            </form>

            <div className="text-center mt-6">
              <a href="/admin/login" className="text-xs text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors">
                Already initialized? Log In
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
