import React, { useState, useEffect } from 'react';
import API from '../config';

const STATIC_FALLBACK_SKILLS = [
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
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await API.get('/portfolio/skills');
        if (res.data && res.data.length > 0) {
          setSkills(res.data);
        } else {
          setSkills(STATIC_FALLBACK_SKILLS);
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic skills, using fallback list:', err);
        setSkills(STATIC_FALLBACK_SKILLS);
      }
    };
    fetchSkills();
  }, []);

  const displaySkills = skills.length > 0 ? skills : STATIC_FALLBACK_SKILLS;
  
  // Ensure the list is long enough to cover the screen and animate smoothly without breaking the loop
  const listToRender = displaySkills.length < 6 
    ? [...displaySkills, ...displaySkills, ...displaySkills, ...displaySkills]
    : [...displaySkills, ...displaySkills];

  return (
    <section className="flex flex-col lg:flex-row items-center gap-8 px-6 md:px-12 lg:px-24 py-12 bg-slate-100 dark:bg-white/5 border-y border-slate-200 dark:border-white/5 overflow-hidden transition-colors duration-300">
      <div className="shrink-0 w-full lg:w-80 text-center lg:text-left">
        <h4 className="text-slate-900 dark:text-white text-lg md:text-xl font-bold uppercase tracking-wider">Skills & Technologies</h4>
      </div>
      
      <div className="relative w-full flex-1 overflow-hidden mask-marquee">
        <div className="flex gap-8 items-center w-max animate-marquee">
          {listToRender.map((skill, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#050914] border border-slate-200 dark:border-white/10 rounded-xl shrink-0 shadow-sm dark:shadow-none"
            >
              <i className={`${skill.iconClass || 'fa-solid fa-code text-indigo-500'} text-xl`}></i>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{skill.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Marquee;
