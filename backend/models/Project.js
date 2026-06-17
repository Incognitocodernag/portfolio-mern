const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [{ type: String }],
  repoLink: { type: String, default: '' },
  liveLink: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
