import React, { useState, useEffect } from 'react';
import { GraduationCap, Laptop, FolderOpen, Bolt, ArrowDown, Linkedin, Github } from 'lucide-react';

const WORDS = [
  "scalable websites.",
  "robust SaaS products.",
  "custom software platforms.",
  "high-impact digital solutions."
];

function Hero() {
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    let timer;
    const currentWord = WORDS[wordIdx];

    const type = () => {
      if (isDeleting) {
        setText(currentWord.substring(0, charIdx - 1));
        setCharIdx(prev => prev - 1);
      } else {
        setText(currentWord.substring(0, charIdx + 1));
        setCharIdx(prev => prev + 1);
      }
    };

    let speed = 80;
    if (isDeleting) speed /= 2;

    if (!isDeleting && charIdx === currentWord.length) {
      speed = 2000; // Wait at completion
      setIsDeleting(true);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setWordIdx(prev => (prev + 1) % WORDS.length);
      speed = 400; // Pause before next word
    }

    timer = setTimeout(type, speed);
    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, wordIdx]);

  return (
    <section className="relative flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 md:px-12 lg:px-24 py-16 md:py-24 overflow-hidden transition-colors duration-300">
      <div className="flex flex-col gap-6 max-w-[680px] w-full relative z-10">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">ARUNABHA NAG // B.TECH CSE 3RD YEAR</span>
        </div>

        {/* Headline */}
        <h1 className="text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight font-extrabold tracking-tight min-h-[120px] md:min-h-[160px]">
          I build <span className="text-orange-500">{text}</span>
          <span className="border-r-2 border-orange-500 animate-pulse">&nbsp;</span>
        </h1>

        {/* Highlights */}
        <ul className="flex flex-col gap-4 mt-2">
          <li className="flex items-start gap-3">
            <GraduationCap className="text-orange-500 w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
              3rd Year B.Tech Computer Science & Engineering student at university.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <Laptop className="text-orange-500 w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
              Aspiring Full-Stack Software Developer focused on clean code and reliable products.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <FolderOpen className="text-orange-500 w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
              Creator of <span className="text-orange-500 font-semibold">WealthifyMe</span>, a personal finance and wealth management dashboard.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <Bolt className="text-orange-500 w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
              Committed to learning modern architectures, backend systems, and API design.
            </p>
          </li>
        </ul>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <a href="#projects" className="px-8 py-4 rounded-lg bg-orange-500 text-black font-bold text-base md:text-lg hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300">
            View My Work
          </a>
          <a href="#contact" className="px-8 py-4 rounded-lg border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white font-semibold text-base md:text-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300 flex items-center gap-2">
            <span>Get in Touch</span>
            <ArrowDown className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Visual Placeholder Card */}
      <div className="flex flex-col items-center gap-6 w-full max-w-[420px] shrink-0 relative z-10">
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050914]/80 p-4 w-full shadow-2xl backdrop-blur-md hover:border-orange-500/30 transition-all duration-500 group">
          <div className="aspect-square w-full rounded-2xl bg-gradient-to-tr from-[#1B1913] to-[#243620] overflow-hidden flex items-center justify-center relative">
            <svg className="w-1/2 h-1/2 text-orange-500/40 group-hover:scale-105 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-sm border border-white/5 rounded-xl p-3 text-center text-white">
              <span className="text-xs text-orange-500 font-bold uppercase tracking-wider">Academic Focus</span>
              <p className="text-sm font-semibold">Web Development & Core CS</p>
            </div>
          </div>
        </div>

        {/* Social connections */}
        <div className="flex gap-6 text-2xl text-slate-500 dark:text-slate-400">
          <a href="https://linkedin.com/in/arunabha-nag/" className="hover:text-orange-500 transition-colors duration-300" target="_blank" rel="noopener noreferrer">
            <Linkedin className="w-6 h-6" />
          </a>
          <a href="https://github.com/ArunabhaNag" className="hover:text-orange-500 transition-colors duration-300" target="_blank" rel="noopener noreferrer">
            <Github className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
