const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Household = require("../models/Household");
const { protect } = require("../middleware/auth");

// ── GET ALL TRANSACTIONS (WITH SCOPE) ──────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const { scope } = req.query; // 'personal', 'household', or 'all'

    // Find the household the user belongs to
    const userHousehold = await Household.findOne({
      "members.userId": req.user._id,
    });

    let query = {};

    if (scope === "personal") {
      // Personal only (belonging to user AND not shared)
      query = { userId: req.user._id, householdId: null };
    } else if (scope === "household") {
      // Household shared only
      if (!userHousehold) {
        return res.json([]); // User is not in a household
      }
      query = { householdId: userHousehold._id };
    } else {
      // 'all' (default): user's personal + household shared
      if (userHousehold) {
        query = {
          $or: [
            { userId: req.user._id, householdId: null },
            { householdId: userHousehold._id },
          ],
        };
      } else {
        query = { userId: req.user._id, householdId: null };
      }
    }

    const transactions = await Transaction.find(query)
      .populate("userId", "name email") // Populate creator details for UI
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    console.error("Could not fetch transactions:", error);
    res.status(500).json({ message: "Could not fetch transactions" });
  }
});

// ── ADD NEW TRANSACTION ───────────────────────────────────────
router.post("/", protect, async (req, res) => {
  try {
    const { amount, category, type, note, isShared, date } = req.body;

    // 1. Basic validation
    if (!amount || !category || !type) {
      return res.status(400).json({ message: "Amount, category, and type are required" });
    }

    const safeType = String(type).toLowerCase();
    if (!["income", "expense"].includes(safeType)) {
      return res.status(400).json({ message: "Type must be either 'income' or 'expense'" });
    }

    // 2. Handle Household Share check
    let targetHouseholdId = null;
    if (isShared) {
      const userHousehold = await Household.findOne({ "members.userId": req.user._id });
      if (!userHousehold) {
        return res.status(400).json({ message: "You are not a member of any household to share this transaction." });
      }

      // Enforce Role check: viewer cannot create household transactions (read-only)
      const member = userHousehold.members.find(
        (m) => m.userId.toString() === req.user._id.toString()
      );
      if (member && member.role === "viewer") {
        return res.status(403).json({ message: "You only have 'viewer' privileges. You cannot add transactions to this household." });
      }

      targetHouseholdId = userHousehold._id;
    }

    // 3. Create the transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      householdId: targetHouseholdId,
      amount: Number(amount),
      category: String(category).trim(),
      type: safeType,
      note: note ? String(note).trim() : "",
      date: date ? new Date(date) : Date.now(),
    });

    // Populate creator info
    const populated = await Transaction.findById(transaction._id).populate("userId", "name email");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Database save error:", error);
    res.status(400).json({ message: error.message || "Database rejected the transaction" });
  }
});

// ── DELETE TRANSACTION ────────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // 1. Personal Transaction Check
    if (!transaction.householdId) {
      if (transaction.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorised to delete this transaction" });
      }
      await Transaction.findByIdAndDelete(req.params.id);
      return res.json({ message: "Transaction deleted" });
    }

    // 2. Household Transaction Check
    const household = await Household.findById(transaction.householdId);
    if (!household) {
      // Fallback: if household is deleted, clean up transaction
      await Transaction.findByIdAndDelete(req.params.id);
      return res.json({ message: "Transaction deleted" });
    }

    const member = household.members.find(
      (m) => m.userId.toString() === req.user._id.toString()
    );
    if (!member) {
      return res.status(403).json({ message: "You are not a member of the household sharing this transaction." });
    }

    // Role-based access logic
    if (member.role === "viewer") {
      return res.status(403).json({ message: "You only have 'viewer' privileges. Deletion denied." });
    }

    if (member.role === "member") {
      // Members can only delete their own transactions
      if (transaction.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "As a household member, you can only delete transactions that you created." });
      }
    }

    // Owner and Admin can delete any transaction in the household
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Could not delete transaction" });
  }
});

module.exports = router;