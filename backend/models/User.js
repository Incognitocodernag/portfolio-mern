const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  securityQuestion: { type: String, required: true, default: "What was the name of your first pet?" },
  securityAnswer: { type: String, required: true, default: "$2a$10$UnSeCureDeFaUlTaNsWeRhAsHeD" } // default dummy hash
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
