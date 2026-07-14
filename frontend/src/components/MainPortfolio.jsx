import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Linkedin, Github, Mail, ShieldCheck, Cpu } from 'lucide-react';
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
      <footer className="w-full pt-16 pb-8 border-t border-slate-200 dark:border-white/5 relative z-10 bg-white dark:bg-[#02050E] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 w-full">
          
          {/* Main Footer Links & Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12">
            
            {/* Left Column: Brand & Bio */}
            <div className="space-y-4">
              <span className="text-slate-900 dark:text-white text-lg font-black tracking-widest uppercase">
                ARUNABHA <span className="text-orange-500">NAG</span>
              </span>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                Full Stack Developer specializing in high-performance system designs, clean architectures, and defensive security engineering.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>OWASP Secure Coding Certified</span>
              </div>
            </div>

            {/* Middle Column: Quick Navigation Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Navigation</h4>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                <li>
                  <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-500 transition-colors duration-150">Home</a>
                </li>
                <li>
                  <a href="#journey" className="text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-500 transition-colors duration-150">Timeline</a>
                </li>
                <li>
                  <a href="#projects" className="text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-500 transition-colors duration-150">Featured Projects</a>
                </li>
                <li>
                  <a href="#contact" className="text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-500 transition-colors duration-150">Get in Touch</a>
                </li>
              </ul>
            </div>

            {/* Right Column: Connect & Socials */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Connect</h4>
              <div className="flex items-center gap-4">
                <a 
                  href="https://linkedin.com/in/arunabha-nag" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-500 hover:bg-orange-500/10 transition-all duration-200"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://github.com/Incognitocodernag" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-500 hover:bg-orange-500/10 transition-all duration-200"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="mailto:arunabhanag3000@gmail.com" 
                  className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-500 hover:bg-orange-500/10 transition-all duration-200"
                  aria-label="Email Contact"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
                Open to full-time engineering opportunities and contract consulting.
              </p>
            </div>
            
          </div>

          {/* Bottom Bar: Copyright & Compliance */}
          <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
            <div className="space-y-1 text-center sm:text-left">
              <p>&copy; {new Date().getFullYear()} Arunabha Nag. All rights reserved.</p>
              <p className="text-[10px] text-slate-400">Handcrafted using React, Node.js, and Tailwind CSS. Designed with defense-in-depth principles.</p>
            </div>

            <div className="flex items-center gap-6">
              {/* System status pulse */}
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>API Gateway: Online</span>
              </div>
              
              <Link to="/admin" className="flex items-center gap-1.5 hover:text-orange-500 transition-colors duration-200 group font-semibold">
                <Lock className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Admin Portal</span>
              </Link>
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  );
}

export default MainPortfolio;
