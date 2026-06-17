import { useState, useEffect } from 'react';

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Default to dark mode for developer portfolio aesthetic
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return [theme, toggleTheme];
}
