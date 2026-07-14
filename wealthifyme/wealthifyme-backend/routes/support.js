const express = require("express");
const router = express.Router();
const SupportTicket = require("../models/SupportTicket");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/email");

// Middleware to optionally set req.user if a valid token is provided
const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Ignore token verification errors for optional protect
    }
  }
  next();
};

router.post("/ticket", optionalProtect, async (req, res) => {
  try {
    const { name, email, subject, message, metadata } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Name, email, subject, and message are required" });
    }

    const ticket = await SupportTicket.create({
      userId: req.user ? req.user._id : null,
      name,
      email,
      subject,
      message,
      metadata,
    });

    // Send email notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "admin@wealthifyme.com";
    const emailOptions = {
      email: adminEmail,
      subject: `🚨 New Support Ticket: ${subject}`,
      html: `
        <h2>New Support Ticket Submitted</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f4f4f4; padding: 10px; border-left: 5px solid #ccc;">
          ${message.replace(/\n/g, "<br>")}
        </blockquote>
        <h3>Metadata:</h3>
        <ul>
          <li><strong>OS:</strong> ${metadata?.os || "N/A"}</li>
          <li><strong>Browser:</strong> ${metadata?.browser || "N/A"}</li>
          <li><strong>Viewport:</strong> ${metadata?.viewport || "N/A"}</li>
          <li><strong>URL:</strong> ${metadata?.url || "N/A"}</li>
          <li><strong>User Agent:</strong> ${metadata?.userAgent || "N/A"}</li>
        </ul>
      `,
    };

    try {
      await sendEmail(emailOptions);
    } catch (emailErr) {
      console.error("Failed to send admin notification email:", emailErr);
      // Do not fail the request if email sending failed, database record is created
    }

    res.status(201).json({
      success: true,
      message: "Support ticket submitted successfully",
      ticket,
    });
  } catch (error) {
    console.error("Support ticket submission error:", error);
    res.status(500).json({ message: "Could not submit support ticket" });
  }
});

module.exports = router;
