import React from 'react';
import useTheme from '../useTheme';
import { Sun, Moon } from 'lucide-react';

function ThemeToggle({ className = '' }) {
  const [theme, toggleTheme] = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-800 dark:text-slate-200 duration-300 flex items-center justify-center shrink-0 ${className}`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Theme Toggle"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-orange-400 animate-spin-slow" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600" />
      )}
    </button>
  );
}

export default ThemeToggle;
