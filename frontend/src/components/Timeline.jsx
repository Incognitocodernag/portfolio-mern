import React, { useState, useEffect } from 'react';
import API from '../config';

const FALLBACK_TIMELINE = [
  {
    _id: 'fb1',
    type: 'Education',
    title: 'B.Tech in Computer Science & Engineering',
    organization: 'University',
    duration: '2023 - 2027',
    bullets: [
      'Studying key foundation principles including Data Structures, Algorithms, Operating Systems, and DBMS.',
      'Maintained a strong focus on algorithmic problem solving and secure programming principles.'
    ]
  },
  {
    _id: 'fb2',
    type: 'Specialization',
    title: 'Full-Stack Web Engineering',
    organization: 'Self-Guided Mastery',
    duration: '2024 - Present',
    bullets: [
      'Dedicated hours to learning modern user experience design using Tailwind CSS and React component lifecycles.',
      'Explored backend architectures, database modeling with PostgreSQL, and cloud deployments on Vercel.'
    ]
  },
  {
    _id: 'fb3',
    type: 'Project Milestone',
    title: 'WealthifyMe Development',
    organization: 'Creator & Lead Architect',
    duration: '2025',
    bullets: [
      'Architected a full-stack personal finance application using the MERN stack to track transactions and target-based savings goals.',
      'Reduced API latency by 40% (average 72ms) using MongoDB compound indexing, and optimized React page loads to 1.1 seconds via lazy loading.'
    ]
  }
];

function Timeline() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await API.get('/portfolio/timeline');
        if (Array.isArray(response.data) && response.data.length > 0) {
          setMilestones(response.data);
        } else {
          setMilestones(FALLBACK_TIMELINE);
        }
      } catch (error) {
        console.warn('API error fetching timeline, using fallback roadmap data.');
        setMilestones(FALLBACK_TIMELINE);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  return (
    <section id="journey" className="w-full max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24 py-24 transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-16">
        
        {/* Left Sticky Column */}
        <div className="lg:sticky lg:top-28 h-fit self-start relative z-10">
          <span className="text-orange-500 uppercase tracking-widest text-xs font-bold">Academic & Skill Roadmap</span>
          <h2 className="mt-4 text-slate-900 dark:text-white text-4xl md:text-5xl font-extrabold leading-tight">
            Learning & Growth <span className="text-orange-500">Timeline</span>
          </h2>
          <p className="mt-6 text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed max-w-[500px]">
            My developmental roadmap as a computer science student, building projects and mastering core concepts step-by-step.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <div className="w-16 h-[2px] bg-orange-500"></div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Roadmap Milestones • Scroll to Stack</p>
          </div>
        </div>

        {/* Right Stacked Cards Column */}
        <div className="flex flex-col gap-16 relative">
          
          {loading ? (
            // Skeleton Loaders
            [1, 2, 3].map((num) => (
              <div 
                key={num} 
                className="sticky top-28 rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#050914] p-8 shadow-2xl animate-pulse min-h-[220px]"
                style={{ zIndex: num * 10 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="h-6 w-24 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                  <div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded"></div>
                </div>
                <div className="h-7 w-2/3 bg-slate-200 dark:bg-white/10 rounded mb-4"></div>
                <div className="h-4 w-1/3 bg-slate-200 dark:bg-white/10 rounded mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-200 dark:bg-white/10 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            // Stacking timeline cards
            milestones.map((milestone, idx) => (
              <div 
                key={milestone._id || idx} 
                className="sticky top-28 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-[#121620] dark:via-[#050914] dark:to-[#02050E] p-8 shadow-2xl hover:border-orange-500/30 transition-all duration-500"
                style={{ zIndex: (idx + 1) * 10 }}
              >
                <div className="flex items-center justify-between">
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border border-orange-500/30 bg-orange-500/10 text-orange-500">
                    {milestone.type}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">{milestone.duration}</span>
                </div>
                <h3 className="mt-6 text-slate-900 dark:text-white text-2xl font-bold">{milestone.title}</h3>
                <p className="mt-1 text-orange-500 text-sm font-medium">{milestone.organization}</p>
                <ul className="mt-6 flex flex-col gap-3">
                  {milestone.bullets && milestone.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-3">
                      <div className="mt-2 w-2 h-2 rounded-full bg-orange-500 shrink-0"></div>
                      <p className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed">{bullet}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}

        </div>
      </div>
    </section>
  );
}

export default Timeline;
