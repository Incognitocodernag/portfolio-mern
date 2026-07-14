// routes/auth.js — Register, Login, Verification, and Google OAuth
const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const crypto  = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User    = require("../models/User");
const sendEmail = require("../utils/email");
const { protect } = require("../middleware/auth");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helper: create a signed JWT token ────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }  // token expires in 7 days
  );
};

// ── Helper: Password strength validator ──────────────────────
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasDigit && hasSpecial;
};

// ── POST /api/auth/register ───────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character." 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered. Please login." });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry

    // Create user (set to verified by default to bypass email dependencies in production/free setups)
    const user = await User.create({ 
      name, 
      email, 
      password,
      isVerified: true,
      verificationToken,
      verificationTokenExpires
    });

    // Send welcome email (optional fallback, does not block registration on SMTP failure)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0d9488; text-align: center;">Welcome to WealthifyMe!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for signing up. Your account has been initialized and is ready to use.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}" style="background: linear-gradient(135deg, #0d9488 0%, #10b981 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Welcome to WealthifyMe",
        html
      });
    } catch (mailError) {
      console.warn("Dev mode SMTP email sending skipped or failed, continuing registration.");
    }

    res.status(201).json({
      message: "Registration successful! Welcome to WealthifyMe.",
      token: generateToken(user._id),
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
      }
    });

  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Email verification check bypassed to work on zero-cost cloud deployments
    if (false && !user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ── GET /api/auth/verify-email/:token ─────────────────────────
router.get("/verify-email/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or has expired." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Send token so they are immediately logged in
    res.json({
      message: "Email verified successfully!",
      token: generateToken(user._id),
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error("Email verification error:", error.message);
    res.status(500).json({ message: "Server error during verification." });
  }
});

// ── POST /api/auth/forgot-password ────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide an email address" });
    }

    const user = await User.findOne({ email });
    
    // Security best practice: do not leak if email exists or not
    const successResponse = { message: "If that email exists in our system, a password reset link has been dispatched." };
    if (!user) {
      return res.json(successResponse);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour expiry
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ef4444; text-align: center;">Reset your WealthifyMe Password</h2>
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your password. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #666;">This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
        <p style="font-size: 12px; color: #ef4444; word-break: break-all;">${resetLink}</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request - WealthifyMe",
      html
    });

    res.json(successResponse);
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ message: "Server error during password recovery." });
  }
});

// ── POST /api/auth/reset-password/:token ──────────────────────
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character." 
      });
    }

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset link is invalid or has expired." });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset completed successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ message: "Server error during password reset." });
  }
});

// ── POST /api/auth/google-login ───────────────────────────────
router.post("/google-login", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: "ID Token is required" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true
      });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Google login error:", err.message);
    res.status(400).json({ message: "Google authentication failed" });
  }
});

// ── PUT /api/auth/password (Change Password) ──────────────────
router.put("/password", protect, async (req, res) => {
  try {
    const { current, newPw } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.matchPassword(current);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    if (!validatePasswordStrength(newPw)) {
      return res.status(400).json({ 
        message: "New password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character." 
      });
    }

    user.password = newPw;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error.message);
    res.status(500).json({ message: "Server error during password update" });
  }
});

module.exports = router;