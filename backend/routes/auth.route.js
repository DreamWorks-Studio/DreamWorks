import express from 'express'
import { google, signin, signup, signout } from '../controller/auth.controller.js';
import nodemailer from 'nodemailer'
import User from '../model/user.model.js';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.get("/signout", signout);

router.post("/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Generate reset token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      // Save token to user document
      user.resetToken = token;
      user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
      await user.save();
  
      // Create frontend URL with environment variable
      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${user._id}/${token}`;
  
      // Send Email with Reset Link - More secure configuration
      let transporter;
      
      // Log to help with debugging
      console.log("Setting up nodemailer with:", {
        emailUser: process.env.EMAIL_USER ? "Configured" : "Missing",
        emailPass: process.env.EMAIL_PASS ? "Configured" : "Missing"
      });
      
      try {
        transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // This should be an app password
          },
          debug: true, // Add debug for troubleshooting
        });
      } catch (emailSetupError) {
        console.error("Email Setup Error:", emailSetupError);
        return res.status(500).json({ message: "Error setting up email service" });
      }
  
      const mailOptions = {
        from: `"Password Reset" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Reset Your Password",
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #b45309;">Password Reset Request</h2>
            <p>Hello ${user.username},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #b45309; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          </div>
        `,
      };
      
      // Use Promise for better error handling
      try {
        await new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Email Send Error:", error);
              reject(error);
            } else {
              console.log("Email sent:", info.response);
              resolve(info);
            }
          });
        });
        
        res.json({ message: "Reset link sent to your email" });
      } catch (emailSendError) {
        console.error("Email Send Error:", emailSendError);
        return res.status(500).json({ message: "Error sending email" });
      }
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/reset-password/:id/:token", async (req, res) => {
    try {
      const { id, token } = req.params;
      const { newPassword } = req.body;
  
      if (!newPassword) return res.status(400).json({ message: "New password is required" });
  
      // Find user by ID
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Verify token matches stored token and is not expired
      if (user.resetToken !== token || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
        return res.status(401).json({ message: "Token expired or invalid" });
      }
  
      // Verify JWT
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id !== id) {
          return res.status(401).json({ message: "Invalid token" });
        }
      } catch (error) {
        return res.status(401).json({ message: "Token expired or invalid" });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update user password and clear reset token
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
  
      res.json({ message: "Password has been reset successfully!" });
    } catch (error) {
      console.error("Reset Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
export default router;