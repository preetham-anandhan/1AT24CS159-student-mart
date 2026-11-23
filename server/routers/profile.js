const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/users");
const authenticate = require("../middleware/authenticate");

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Could not load profile:", error.message);
    return res.status(500).json({ message: "Could not load profile" });
  }
});

router.put("/", async (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }

  try {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.userId }
    });
    if (existingUser) {
      return res.status(409).json({ message: "That email is already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "That email is already in use" });
    }

    console.error("Could not update profile:", error.message);
    return res.status(500).json({ message: "Could not update profile" });
  }
});

router.put("/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    !currentPassword ||
    !newPassword
  ) {
    return res.status(400).json({
      message: "Current password and new password are required"
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "New password must be at least 6 characters long"
    });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Could not change password:", error.message);
    return res.status(500).json({ message: "Could not change password" });
  }
});

module.exports = router;
