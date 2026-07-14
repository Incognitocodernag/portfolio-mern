const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member", "viewer"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const HouseholdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Household name is required"],
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteCode: {
      type: String,
      unique: true,
      required: true,
    },
    members: [MemberSchema],
    sharedBudget: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Household", HouseholdSchema);