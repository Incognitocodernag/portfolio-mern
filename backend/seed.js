const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');
const Timeline = require('./models/Timeline');

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
        description: 'A full-stack personal finance and wealth tracker built with the MERN stack. Features secure user authentication, interactive dashboards, structured MongoDB database schemas for transaction logging, and robust Express.js REST API endpoints to monitor expenses and savings goals.',
        tags: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Tailwind CSS'],
        repoLink: 'https://github.com/ArunabhaNag',
        liveLink: 'https://github.com/ArunabhaNag'
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
          'Designed and built a complete wealth manager application from scratch to track investments and savings goals.',
          'Integrated real-time charts to visualize financial metrics, optimizing render states for smooth performance.'
        ]
      }
    ];
    await Timeline.insertMany(initialTimeline);
    console.log('✓ Seeding timeline milestones completed.');

    console.log('Database seeding successfully finished!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding database failed:', error);
    process.exit(1);
  }
};

seedData();
