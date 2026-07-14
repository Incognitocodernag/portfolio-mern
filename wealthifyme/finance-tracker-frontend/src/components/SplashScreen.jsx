import { useEffect } from "react";

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const t = setTimeout(onComplete, 2800);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark-bg splash-exit">
      {/* Ripple ring behind coin */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-teal-400/20 ripple-anim" />
        <div className="coin-anim relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/40">
          <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
          </svg>
        </div>
      </div>

      {/* Brand text */}
      <div className="text-anim text-center">
        <h1 className="text-5xl font-extrabold tracking-tight">
          <span className="text-white">Wealthify</span>
          <span className="text-teal-400">Me</span>
        </h1>
      </div>

      <p className="tagline-anim mt-2 text-slate-400 tracking-[0.3em] uppercase text-xs font-medium">
        Personal Finance
      </p>

      {/* Progress bar */}
      <div className="mt-12 w-56 h-0.5 bg-dark-border rounded-full overflow-hidden">
        <div className="bar-anim h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full" />
      </div>
    </div>
  );
};

export default SplashScreen;