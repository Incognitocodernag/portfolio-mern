const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    default: 'General'
  },
  iconClass: {
    type: String,
    default: 'fa-solid fa-code text-indigo-500'
  }
}, { timestamps: true });

module.exports = mongoose.model('Skill', SkillSchema);
