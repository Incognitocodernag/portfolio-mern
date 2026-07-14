// User.js — User model with automatic password hashing
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
    },
    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,       // no duplicate emails
      lowercase: true,
      trim:      true,
    },
    password: {
      type:      String,
      required:  [function() { return !this.googleId; }, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    isVerified: {
      type:    Boolean,
      default: false,
    },
    verificationToken:        String,
    verificationTokenExpires: Date,
    resetPasswordToken:       String,
    resetPasswordExpires:     Date,
    googleId:                 String,
    stripeCustomerId:         String,
    stripeSubscriptionId:     String,
    subscriptionStatus: {
      type:    String,
      enum:    ["free", "pro"],
      default: "free",
    },
    subscriptionPeriodEnd:    Date,
  },
  { timestamps: true }       // auto adds createdAt and updatedAt
);

// Hash password before saving to DB 
UserSchema.pre("save", async function (next) {
  // Only hash if password field was actually changed
  if (!this.isModified("password")) return next();
  const salt    = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password at login 
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);