const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/v1/auth/status - Check if there is already an admin account initialized
router.get('/status', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ adminInitialized: userCount > 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error check' });
  }
});

// POST /api/v1/auth/login - Standard admin login
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

// POST /api/v1/auth/register - Create admin account (open ONLY if no users exist, or if current request is from an authenticated admin)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Malformed input parameters.' });
  }

  if (username.length < 3 || username.length > 50 || password.length < 6 || password.length > 100) {
    return res.status(400).json({ message: 'Invalid username (3-50 chars) or password (6-100 chars).' });
  }

  try {
    const userCount = await User.countDocuments();
    
    // If a user exists, require active admin session to register more
    if (userCount > 0) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Registration is locked. An admin account already exists.' });
      }

      const token = authHeader.split(' ')[1];
      try {
        jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      } catch (err) {
        return res.status(403).json({ message: 'Registration is locked. Invalid token.' });
      }
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword
    });
    await newUser.save();

    res.status(201).json({ message: 'Admin account registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// PUT /api/v1/auth/update-profile - Update admin username/password (requires login token)
router.put('/update-profile', auth, async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  const userId = req.adminUser.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Admin user not found.' });
    }

    // Verify current password if user is setting a new password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password.' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken.' });
      }
      user.username = username;
    }

    await user.save();
    res.json({ message: 'Profile updated successfully.', username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

module.exports = router;
