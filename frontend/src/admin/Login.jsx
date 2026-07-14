import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../config';
import ThemeToggle from '../components/ThemeToggle';
import { Lock, User, Loader2, Eye, EyeOff, ShieldQuestion } from 'lucide-react';

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Recovery States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [recoveryQuestion, setRecoveryQuestion] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');

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
      const response = await API.post('/auth/login', credentials);
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

  const handleFetchQuestion = async () => {
    setRecoveryError('');
    if (!recoveryUsername.trim()) {
      setRecoveryError('Please enter your username.');
      return;
    }

    setRecoveryLoading(true);
    try {
      const response = await API.post('/auth/forgot-password/question', { username: recoveryUsername });
      setRecoveryQuestion(response.data.securityQuestion);
      setRecoveryStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to retrieve security question.';
      setRecoveryError(msg);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');

    if (recoveryNewPassword.length < 6) {
      setRecoveryError('New password must be at least 6 characters.');
      return;
    }

    setRecoveryLoading(true);
    try {
      const payload = {
        username: recoveryUsername,
        securityAnswer: recoveryAnswer,
        newPassword: recoveryNewPassword
      };
      const response = await API.post('/auth/forgot-password/reset', payload);
      setRecoverySuccess(response.data.message || 'Password reset successfully! Redirecting...');
      setTimeout(() => {
        setShowForgotPassword(false);
        setRecoveryStep(1);
        setRecoveryUsername('');
        setRecoveryAnswer('');
        setRecoveryNewPassword('');
        setRecoverySuccess('');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password.';
      setRecoveryError(msg);
    } finally {
      setRecoveryLoading(false);
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
        
        {showForgotPassword ? (
          // Forgot Password / Recovery Flow
          <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-6">
            <div className="text-center mb-2">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-2xl mx-auto mb-4">
                <ShieldQuestion className="w-6 h-6" />
              </div>
              <h2 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">Password Reset</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">Reset password using your recovery question</p>
            </div>

            {recoveryError && (
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 dark:text-rose-400 text-sm font-semibold">
                {recoveryError}
              </div>
            )}

            {recoverySuccess && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-sm font-semibold">
                {recoverySuccess}
              </div>
            )}

            {recoveryStep === 1 ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Username</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryUsername}
                    onChange={(e) => setRecoveryUsername(e.target.value)}
                    placeholder="Enter Admin Username"
                    className="px-4 py-3 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFetchQuestion}
                  disabled={recoveryLoading}
                  className="w-full py-4 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-600 transition-colors duration-300 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 text-sm"
                >
                  {recoveryLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  <span>Verify Username</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#02050E]/40 flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Security Question</span>
                  <span className="text-slate-800 dark:text-slate-200 text-sm font-semibold leading-relaxed">{recoveryQuestion}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Your Answer</label>
                  <input
                    type="text"
                    required
                    value={recoveryAnswer}
                    onChange={(e) => setRecoveryAnswer(e.target.value)}
                    placeholder="Enter recovery answer"
                    className="px-4 py-3 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>New Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={recoveryNewPassword}
                      onChange={(e) => setRecoveryNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all text-sm"
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

                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="w-full py-4 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-600 transition-colors duration-300 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 text-sm"
                >
                  {recoveryLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  <span>Reset Password</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setRecoveryStep(1);
                setRecoveryError('');
                setRecoverySuccess('');
              }}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors self-center mt-4"
            >
              Cancel and Return
            </button>
          </form>
        ) : (
          // Standard Admin Login Flow
          <>
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
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-orange-500 hover:text-orange-600 transition-colors font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    required
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="••••••••" 
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-[#02050E]/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all duration-300"
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
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
