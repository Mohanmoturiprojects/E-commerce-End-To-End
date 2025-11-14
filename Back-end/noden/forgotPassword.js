import express from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { User } from "./models/user.js";

const router = express.Router();

// ✅ Step 1: Forgot Password - Generate token & send reset link
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { username: email } });

    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // ✅ Fix: use Date object

    // Save token before sending email
    user.resetToken = token;
    user.resetTokenExpiry = tokenExpiry;
    await user.save(); // ✅ Save before sending

    const resetLink = `http://localhost:5175/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Logical Mart Support" <${process.env.EMAIL_USER}>`,
      to: user.username,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset Request</h3>
        <p>Hello ${user.firstName || "User"},</p>
        <p>Click below to reset your password (valid for 60 minutes):</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
      `,
    });

    return res.json({ message: "✅ Reset link sent to your email" });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ message: "Error sending reset link" });
  }
});


// ✅ Step 2: Reset Password
   router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({ where: { resetToken: token } });

    if (!user || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    // Clear reset fields
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.json({ message: "✅ Password updated successfully" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
});


export { router as forgotPasswordRoute };
