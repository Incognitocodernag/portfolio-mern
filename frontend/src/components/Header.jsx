import React from 'react';
import { ArrowRight, FileDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-[4.5rem] px-6 md:px-12 lg:px-24 bg-white/80 dark:bg-[#02050E]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 w-full transition-colors duration-300">
      <a className="flex items-center gap-3 shrink-0" href="#">
        <span className="text-slate-900 dark:text-white text-lg md:text-xl font-extrabold tracking-widest uppercase">
          ARUNABHA <span className="text-orange-500">NAG</span>
        </span>
      </a>
      
      <div className="flex items-center gap-3 md:gap-5 shrink-0">
        <a 
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300" 
          href="/Arunabha_Nag_CV.pdf"
          download="Arunabha_Nag_CV.pdf"
        >
          <FileDown className="w-4 h-4 text-orange-500" />
          <span>Resume</span>
        </a>

        <a className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-orange-500 text-orange-500 text-sm font-semibold hover:bg-orange-500 hover:text-black transition-all duration-300" href="#journey">
          <span>Timeline</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </a>
        
        <a className="px-4 py-2 rounded-lg bg-orange-500 text-black text-sm font-semibold hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-500/20" href="#contact">
          Get In Touch
        </a>

        {/* Dynamic Light/Dark Mode switch */}
        <ThemeToggle />
      </div>
    </header>
  );
}

export default Header;
