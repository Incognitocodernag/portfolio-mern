import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../config';
import ThemeToggle from '../components/ThemeToggle';
import { UserPlus, User, Lock, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

function Register() {
  const [credentials, setCredentials] = useState({ username: '', password: '', confirmPassword: '' });
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
        // Fallback to safe side
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

    setLoading(true);

    try {
      const payload = {
        username: credentials.username,
        password: credentials.password
      };
      const response = await API.post('/auth/register', payload);
      setSuccess(response.data.message || 'Registration successful! Redirecting...');
      setCredentials({ username: '', password: '', confirmPassword: '' });
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

      <div className="w-full max-w-[450px] rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050914]/80 p-8 shadow-2xl backdrop-blur-md relative z-10 transition-colors duration-300">
        
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
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
                  className="px-4 py-3 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Password</span>
                </label>
                <input 
                  type="password" 
                  name="password" 
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  className="px-4 py-3 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Confirm Password</span>
                </label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  required
                  value={credentials.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  className="px-4 py-3 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300 text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-600 transition-colors duration-300 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 text-sm"
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
