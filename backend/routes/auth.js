const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Type validation to prevent type-injection attacks
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Malformed input parameters.' });
  }

  // Length constraints
  if (username.length > 50 || password.length > 100) {
    return res.status(400).json({ message: 'Input length exceeds secure limits.' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    // Set secure token expiration window (2 hours)
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '2h' }
    );

    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
