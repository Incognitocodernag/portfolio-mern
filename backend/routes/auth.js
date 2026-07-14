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
  const { username, password, securityQuestion, securityAnswer } = req.body;

  if (typeof username !== 'string' || typeof password !== 'string' || typeof securityQuestion !== 'string' || typeof securityAnswer !== 'string') {
    return res.status(400).json({ message: 'Malformed input parameters.' });
  }

  if (username.length < 3 || username.length > 50 || password.length < 6 || password.length > 100) {
    return res.status(400).json({ message: 'Invalid username (3-50 chars) or password (6-100 chars).' });
  }

  if (securityQuestion.length < 5 || securityAnswer.length < 2) {
    return res.status(400).json({ message: 'Invalid security question or answer.' });
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
    const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      securityQuestion,
      securityAnswer: hashedAnswer
    });
    await newUser.save();

    res.status(201).json({ message: 'Admin account registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/v1/auth/forgot-password/question - Get security question for username
router.post('/forgot-password/question', async (req, res) => {
  const { username } = req.body;
  if (typeof username !== 'string') {
    return res.status(400).json({ message: 'Username is required.' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Admin user not found.' });
    }

    res.json({ securityQuestion: user.securityQuestion });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving recovery question.' });
  }
});

// POST /api/v1/auth/forgot-password/reset - Verify answer and reset password
router.post('/forgot-password/reset', async (req, res) => {
  const { username, securityAnswer, newPassword } = req.body;

  if (typeof username !== 'string' || typeof securityAnswer !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ message: 'Malformed input parameters.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Admin user not found.' });
    }

    const isMatch = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswer);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect security recovery answer.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error resetting password.' });
  }
});

// PUT /api/v1/auth/update-profile - Update admin username/password/security settings
router.put('/update-profile', auth, async (req, res) => {
  const { username, currentPassword, newPassword, securityQuestion, securityAnswer } = req.body;
  const userId = req.adminUser.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Admin user not found.' });
    }

    // Verify current password if user is changing password or security settings
    if (newPassword || securityQuestion || securityAnswer) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to update security credentials.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password.' });
      }
    }

    // Apply password update
    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Apply security question update
    if (securityQuestion) {
      user.securityQuestion = securityQuestion;
    }

    // Apply security answer update
    if (securityAnswer) {
      user.securityAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);
    }

    // Apply username update
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken.' });
      }
      user.username = username;
    }

    await user.save();
    res.json({ message: 'Profile security settings updated successfully.', username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

module.exports = router;
