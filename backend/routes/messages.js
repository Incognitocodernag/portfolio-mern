const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Public: Submit a contact message
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All contact fields are required' });
  }

  // 1. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address format.' });
  }

  // 2. Enforce length constraints (prevents memory bloating / spam payloads)
  if (name.length > 100 || email.length > 100 || message.length > 3000) {
    return res.status(400).json({ message: 'Input length exceeds secure limits.' });
  }

  // 3. Prevent NoSQL Injection: ensure no operator keys in inputs
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return res.status(400).json({ message: 'Malformed input parameters.' });
  }

  // 4. Sanitize tags to prevent Stored XSS
  const sanitize = (str) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const sanitizedName = sanitize(name.trim());
  const sanitizedEmail = sanitize(email.trim());
  const sanitizedMessage = sanitize(message.trim());

  try {
    const newMessage = new Message({ 
      name: sanitizedName, 
      email: sanitizedEmail, 
      message: sanitizedMessage 
    });
    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error saving message' });
  }
});

// Admin: Retrieve all contact messages
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages' });
  }
});

// Admin: Delete a contact message
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    if (!deletedMessage) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message' });
  }
});

module.exports = router;
