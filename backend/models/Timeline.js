const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'Education', 'Specialization', 'Project Milestone'
  title: { type: String, required: true },
  organization: { type: String, required: true },
  duration: { type: String, required: true }, // e.g., '2023 - 2027', '2024 - Present'
  bullets: [{ type: String }] // array of achievements/details
}, { timestamps: true });

module.exports = mongoose.model('Timeline', timelineSchema);
