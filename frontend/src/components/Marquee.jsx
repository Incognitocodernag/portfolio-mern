import React from 'react';

const SKILLS = [
  { name: 'React.js', iconClass: 'fa-brands fa-react text-sky-400' },
  { name: 'Node.js', iconClass: 'fa-brands fa-node-js text-green-500' },
  { name: 'Express.js', iconClass: 'fa-solid fa-server text-slate-400' },
  { name: 'MongoDB', iconClass: 'fa-solid fa-database text-green-600' },
  { name: 'Tailwind CSS', iconClass: 'fa-solid fa-wind text-cyan-400' },
  { name: 'JavaScript', iconClass: 'fa-brands fa-js text-yellow-400' },
  { name: 'SQL / DBMS', iconClass: 'fa-solid fa-table text-purple-400' },
  { name: 'C++', iconClass: 'fa-solid fa-cubes text-blue-500' },
  { name: 'Git / GitHub', iconClass: 'fa-brands fa-git-alt text-red-500' }
];

function Marquee() {
  return (
    <section className="flex flex-col lg:flex-row items-center gap-8 px-6 md:px-12 lg:px-24 py-12 bg-slate-100 dark:bg-white/5 border-y border-slate-200 dark:border-white/5 overflow-hidden transition-colors duration-300">
      <div className="shrink-0 w-full lg:w-80 text-center lg:text-left">
        <h4 className="text-slate-900 dark:text-white text-lg md:text-xl font-bold uppercase tracking-wider">Skills & Technologies</h4>
      </div>
      
      <div className="relative w-full flex-1 overflow-hidden mask-marquee">
        <div className="flex gap-8 items-center w-max animate-marquee">
          {/* Double list to enable infinite wrap loop */}
          {[...SKILLS, ...SKILLS].map((skill, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#050914] border border-slate-200 dark:border-white/10 rounded-xl shrink-0 shadow-sm dark:shadow-none"
            >
              <i className={`${skill.iconClass} text-xl`}></i>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{skill.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Marquee;
