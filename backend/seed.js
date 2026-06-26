const dns = require('dns');
if (dns.setServers) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');
const Timeline = require('./models/Timeline');
const Skill = require('./models/Skill');

const seedData = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('Error: Please provide a MONGO_URI in your .env file to seed the database.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB. Starting database seeding...');

    // 1. Seed Admin User
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    await User.deleteMany({ username }); // clear old admin with same name

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = new User({
      username,
      password: hashedPassword
    });
    await adminUser.save();
    console.log(`✓ Admin user created successfully:`);
    console.log(`   - Username: ${username}`);
    console.log(`   - Password: ${password} (stored securely as hash)`);

    // 2. Seed Projects
    await Project.deleteMany({});
    const initialProjects = [
      {
        title: 'WealthifyMe',
        description: 'A high-performance MERN-stack wealth tracker featuring secure authentication, optimized MongoDB compound indexes (reducing query latency by 40% to 72ms), and a single-roundtrip $facet aggregation pipeline for real-time metrics. Implemented with OWASP-aligned security headers, IP rate-limiting, and optimistic UI state rendering for instant response.',
        tags: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Tailwind CSS'],
        repoLink: 'https://github.com/Incognitocodernag',
        liveLink: 'https://github.com/Incognitocodernag'
      }
    ];
    await Project.insertMany(initialProjects);
    console.log('✓ Seeding default projects completed.');

    // 3. Seed Timeline Milestones
    await Timeline.deleteMany({});
    const initialTimeline = [
      {
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
    await Timeline.insertMany(initialTimeline);
    console.log('✓ Seeding timeline milestones completed.');

    // 4. Seed Skills
    await Skill.deleteMany({});
    const initialSkills = [
      { name: 'React.js', category: 'Frontend', iconClass: 'fa-brands fa-react text-sky-400' },
      { name: 'Node.js', category: 'Backend', iconClass: 'fa-brands fa-node-js text-green-500' },
      { name: 'Express.js', category: 'Backend', iconClass: 'fa-solid fa-server text-slate-400' },
      { name: 'MongoDB', category: 'Database', iconClass: 'fa-solid fa-database text-green-600' },
      { name: 'Tailwind CSS', category: 'Frontend', iconClass: 'fa-solid fa-wind text-cyan-400' },
      { name: 'JavaScript', category: 'Languages', iconClass: 'fa-brands fa-js text-yellow-400' },
      { name: 'SQL / DBMS', category: 'Database', iconClass: 'fa-solid fa-table text-purple-400' },
      { name: 'C++', category: 'Languages', iconClass: 'fa-solid fa-cubes text-blue-500' },
      { name: 'Git / GitHub', category: 'Tools', iconClass: 'fa-brands fa-git-alt text-red-500' }
    ];
    await Skill.insertMany(initialSkills);
    console.log('✓ Seeding default skills completed.');

    console.log('Database seeding successfully finished!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding database failed:', error);
    process.exit(1);
  }
};

seedData();
