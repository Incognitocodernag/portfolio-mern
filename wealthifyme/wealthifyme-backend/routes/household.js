const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Household = require("../models/Household");
const { protect } = require("../middleware/auth");

// ── Helper: check user's role in household ─────────────────
const getUserRole = (household, userId) => {
  const member = household.members.find(
    (m) => m.userId.toString() === userId.toString()
  );
  return member ? member.role : null;
};

// ── GET /api/household ─────────────────────────────────────
// Get the household the logged-in user belongs to
router.get("/", protect, async (req, res) => {
  try {
    const household = await Household.findOne({
      "members.userId": req.user._id,
    }).populate("members.userId", "name email");

    if (!household) {
      return res.status(404).json({ message: "No household found" });
    }

    res.json(household);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── POST /api/household ────────────────────────────────────
// Create a new household (user becomes owner)
router.post("/", protect, async (req, res) => {
  try {
    const { name, sharedBudget } = req.body;

    // Check user is not already in a household
    const existing = await Household.findOne({
      "members.userId": req.user._id,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You are already in a household. Leave it first." });
    }

    // Generate unique 6-char invite code
    const inviteCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    const household = await Household.create({
      name,
      ownerId: req.user._id,
      inviteCode,
      sharedBudget: sharedBudget || 0,
      members: [{ userId: req.user._id, role: "owner" }],
    });

    res.status(201).json(household);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// ── POST /api/household/join ───────────────────────────────
// Join a household using an invite code
router.post("/join", protect, async (req, res) => {
  try {
    const { inviteCode } = req.body;

    // Check user is not already in a household
    const alreadyIn = await Household.findOne({
      "members.userId": req.user._id,
    });
    if (alreadyIn) {
      return res
        .status(400)
        .json({ message: "You are already in a household. Leave it first." });
    }

    const household = await Household.findOne({ inviteCode });
    if (!household) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    household.members.push({ userId: req.user._id, role: "member" });
    await household.save();

    const populated = await Household.findById(household._id).populate(
      "members.userId",
      "name email"
    );

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── PATCH /api/household/members/:userId ───────────────────
// Change a member's role (owner or admin only)
router.patch("/members/:targetUserId", protect, async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["admin", "member", "viewer"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const household = await Household.findOne({
      "members.userId": req.user._id,
    });
    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }

    const myRole = getUserRole(household, req.user._id);
    if (!["owner", "admin"].includes(myRole)) {
      return res.status(403).json({ message: "Not authorised" });
    }

    const targetMember = household.members.find(
      (m) => m.userId.toString() === req.params.targetUserId
    );
    if (!targetMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Cannot change owner's role
    if (targetMember.role === "owner") {
      return res.status(403).json({ message: "Cannot change owner's role" });
    }

    targetMember.role = role;
    await household.save();

    const populated = await Household.findById(household._id).populate(
      "members.userId",
      "name email"
    );
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE /api/household/members/:userId ──────────────────
// Remove a member (owner/admin only)
router.delete("/members/:targetUserId", protect, async (req, res) => {
  try {
    const household = await Household.findOne({
      "members.userId": req.user._id,
    });
    if (!household) return res.status(404).json({ message: "Not found" });

    const myRole = getUserRole(household, req.user._id);
    if (!["owner", "admin"].includes(myRole)) {
      return res.status(403).json({ message: "Not authorised" });
    }

    const targetMember = household.members.find(
      (m) => m.userId.toString() === req.params.targetUserId
    );
    if (targetMember?.role === "owner") {
      return res.status(403).json({ message: "Cannot remove owner" });
    }

    household.members = household.members.filter(
      (m) => m.userId.toString() !== req.params.targetUserId
    );
    await household.save();

    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE /api/household ──────────────────────────────────
// Leave household (or delete if owner)
router.delete("/", protect, async (req, res) => {
  try {
    const household = await Household.findOne({
      "members.userId": req.user._id,
    });
    if (!household) return res.status(404).json({ message: "Not found" });

    const myRole = getUserRole(household, req.user._id);

    if (myRole === "owner") {
      await Household.findByIdAndDelete(household._id);
      return res.json({ message: "Household deleted" });
    }

    // Non-owner just leaves
    household.members = household.members.filter(
      (m) => m.userId.toString() !== req.user._id.toString()
    );
    await household.save();
    res.json({ message: "Left household" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;