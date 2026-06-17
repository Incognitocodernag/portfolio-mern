import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Header from './Header';
import Hero from './Hero';
import Marquee from './Marquee';
import Timeline from './Timeline';
import Projects from './Projects';
import Contact from './Contact';

function MainPortfolio() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-slate-50 dark:bg-[#02050E] text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* Dynamic Background Glowing Orbs */}
      <div className="glow-bg bg-orange-500/20 dark:bg-orange-500/10 top-[-80px] left-[-80px] transition-all duration-500"></div>
      <div className="glow-bg bg-emerald-500/20 dark:bg-emerald-500/10 top-[400px] right-[-80px] transition-all duration-500"></div>
      <div className="glow-bg bg-indigo-500/20 dark:bg-indigo-500/10 bottom-[200px] left-[-200px] transition-all duration-500"></div>

      {/* Header */}
      <Header />
      
      {/* Sections */}
      <main className="flex-1 w-full relative z-10">
        <Hero />
        <Marquee />
        <Timeline />
        <Projects />
        <Contact />
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-slate-500 dark:text-slate-400 text-sm border-t border-slate-200 dark:border-white/5 relative z-10 bg-white dark:bg-[#02050E] transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full">
          <p>&copy; 2026 Arunabha Nag. All rights reserved. Built with passion & precision.</p>
          <Link to="/admin" className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-500 transition-colors duration-200 group font-medium">
            <Lock className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default MainPortfolio;
