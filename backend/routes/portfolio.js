const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Timeline = require('../models/Timeline');
const Skill = require('../models/Skill');
const auth = require('../middleware/auth');

// ================= Project Routes =================

// Public: Get all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving projects' });
  }
});

// Admin: Create project
router.post('/projects', auth, async (req, res) => {
  const { title, description, tags, repoLink, liveLink } = req.body;
  try {
    const newProject = new Project({ title, description, tags, repoLink, liveLink });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: 'Error creating project' });
  }
});

// Admin: Update project
router.put('/projects/:id', auth, async (req, res) => {
  const { title, description, tags, repoLink, liveLink } = req.body;
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, tags, repoLink, liveLink },
      { new: true }
    );
    if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: 'Error updating project' });
  }
});

// Admin: Delete project
router.delete('/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
});

// ================= Timeline Routes =================

// Public: Get all timeline milestones
router.get('/timeline', async (req, res) => {
  try {
    const milestones = await Timeline.find().sort({ createdAt: 1 });
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving timeline milestones' });
  }
});

// Admin: Create timeline milestone
router.post('/timeline', auth, async (req, res) => {
  const { type, title, organization, duration, bullets } = req.body;
  try {
    const newMilestone = new Timeline({ type, title, organization, duration, bullets });
    await newMilestone.save();
    res.status(201).json(newMilestone);
  } catch (error) {
    res.status(400).json({ message: 'Error creating milestone' });
  }
});

// Admin: Update timeline milestone
router.put('/timeline/:id', auth, async (req, res) => {
  const { type, title, organization, duration, bullets } = req.body;
  try {
    const updatedMilestone = await Timeline.findByIdAndUpdate(
      req.params.id,
      { type, title, organization, duration, bullets },
      { new: true }
    );
    if (!updatedMilestone) return res.status(404).json({ message: 'Milestone not found' });
    res.json(updatedMilestone);
  } catch (error) {
    res.status(400).json({ message: 'Error updating milestone' });
  }
});

// Admin: Delete timeline milestone
router.delete('/timeline/:id', auth, async (req, res) => {
  try {
    const milestone = await Timeline.findByIdAndDelete(req.params.id);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting milestone' });
  }
});

// ================= Skill Routes =================

// Public: Get all skills
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, name: 1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving skills' });
  }
});

// Admin: Create skill
router.post('/skills', auth, async (req, res) => {
  const { name, category, iconClass } = req.body;
  try {
    const newSkill = new Skill({ name, category, iconClass });
    await newSkill.save();
    res.status(201).json(newSkill);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Skill with this name already exists' });
    }
    res.status(400).json({ message: 'Error creating skill' });
  }
});

// Admin: Update skill
router.put('/skills/:id', auth, async (req, res) => {
  const { name, category, iconClass } = req.body;
  try {
    const updatedSkill = await Skill.findByIdAndUpdate(
      req.params.id,
      { name, category, iconClass },
      { new: true, runValidators: true }
    );
    if (!updatedSkill) return res.status(404).json({ message: 'Skill not found' });
    res.json(updatedSkill);
  } catch (error) {
    res.status(400).json({ message: 'Error updating skill' });
  }
});

// Admin: Delete skill
router.delete('/skills/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting skill' });
  }
});

module.exports = router;
