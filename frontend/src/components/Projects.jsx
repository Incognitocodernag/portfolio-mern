import React, { useState, useEffect } from 'react';
import API from '../config';
import { Wallet, Github, ExternalLink } from 'lucide-react';

const FALLBACK_PROJECTS = [
  {
    _id: 'proj1',
    title: 'WealthifyMe',
    description: 'A full-stack personal finance and wealth tracker built with the MERN stack. Features secure user authentication, interactive dashboards, structured MongoDB database schemas for transaction logging, and robust Express.js REST API endpoints to monitor expenses and savings goals.',
    tags: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Tailwind CSS'],
    repoLink: 'https://github.com/ArunabhaNag',
    liveLink: 'https://github.com/ArunabhaNag'
  }
];

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await API.get('/api/portfolio/projects');
        if (Array.isArray(response.data) && response.data.length > 0) {
          setProjects(response.data);
        } else {
          setProjects(FALLBACK_PROJECTS);
        }
      } catch (error) {
        console.warn('API error fetching projects, loading fallback project records.');
        setProjects(FALLBACK_PROJECTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id="projects" className="w-full max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24 py-12 border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
      <div className="text-center max-w-[600px] mx-auto mb-16 relative z-10">
        <span className="text-orange-500 uppercase tracking-widest text-xs font-bold">Portfolio Showcase</span>
        <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">Selected Projects</h2>
        <p className="mt-4 text-slate-500 dark:text-slate-400">A demonstration of fully functional application developments.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-8 relative z-10">
        {loading ? (
          // Projects Skeleton Loader
          <div className="max-w-[750px] w-full rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#050914] p-8 shadow-2xl animate-pulse min-h-[300px]">
            <div className="w-14 h-14 bg-slate-200 dark:bg-white/10 rounded-2xl mb-8"></div>
            <div className="h-8 w-2/3 bg-slate-200 dark:bg-white/10 rounded mb-4"></div>
            <div className="space-y-3 mb-8">
              <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded"></div>
              <div className="h-4 w-5/6 bg-slate-200 dark:bg-white/10 rounded"></div>
            </div>
            <div className="flex gap-2 mb-8">
              <div className="h-6 w-16 bg-slate-200 dark:bg-white/10 rounded-full"></div>
              <div className="h-6 w-20 bg-slate-200 dark:bg-white/10 rounded-full"></div>
            </div>
          </div>
        ) : (
          // Projects Card
          projects.map((project) => (
            <div 
              key={project._id} 
              className="max-w-[750px] w-full rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050914]/80 p-8 hover:border-orange-500/30 transition-all duration-300 group shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest rounded-full">
                  Featured Project
                </span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-2xl mb-8">
                <Wallet className="w-6 h-6" />
              </div>

              <h3 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold group-hover:text-orange-500 transition-colors">
                {project.title}
              </h3>
              
              <p className="mt-4 text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                {project.description}
              </p>

              <div className="mt-8">
                <h4 className="text-xs text-orange-500 font-bold uppercase tracking-wider mb-3">Technologies Employed</h4>
                <div className="flex flex-wrap gap-2 mb-8">
                  {project.tags && project.tags.map((tag, tIdx) => (
                    <span 
                      key={tIdx} 
                      className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  {project.repoLink && (
                    <a 
                      href={project.repoLink} 
                      className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 bg-orange-500 text-black rounded-lg hover:bg-orange-600 transition-all duration-300"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <span>View Source</span>
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {project.liveLink && (
                    <a 
                      href={project.liveLink} 
                      className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-800 dark:text-white transition-all duration-300"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Projects;
