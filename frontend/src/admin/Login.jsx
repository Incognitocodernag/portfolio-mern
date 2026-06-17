import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../config';
import ThemeToggle from '../components/ThemeToggle';
import { Lock, User, Loader2 } from 'lucide-react';

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/api/auth/login', credentials);
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', response.data.username);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-2xl mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">Admin Portal</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">Securely log in to manage your portfolio</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 dark:text-rose-400 text-sm font-semibold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
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
              className="px-4 py-3 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
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
              className="px-4 py-3 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-600 transition-colors duration-300 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>Sign In</span>
          </button>
        </form>

        <div className="text-center mt-8">
          <a href="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors">
            ← Back to Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
