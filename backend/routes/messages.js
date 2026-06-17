const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const logger = require('../logger');

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
    
    // Asynchronous Email Notification Dispatch (Nodemailer)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailTarget = 'arunabhadeveloper@gmail.com';

    if (emailUser && emailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });

      const mailOptions = {
        from: `"Portfolio Alerts" <${emailUser}>`,
        to: emailTarget,
        subject: `💼 New Portfolio Message from ${sanitizedName}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #f97316;">New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${sanitizedName}</p>
            <p><strong>Email:</strong> ${sanitizedEmail}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; padding: 15px; background-color: #f9f9f9; border-radius: 6px; border-left: 4px solid #f97316; font-size: 14px; line-height: 1.6;">${sanitizedMessage}</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions)
        .then(() => logger.info(`Email notification sent to ${emailTarget} for contact form from ${sanitizedEmail}`))
        .catch(err => logger.error('Nodemailer email dispatch failed: %O', err));
    } else {
      logger.warn('Nodemailer SMTP credentials missing. Skipping email notification.');
    }

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    logger.error('Error saving contact form message: %O', error);
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
