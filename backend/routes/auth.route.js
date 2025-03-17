import express from 'express'
import { google, signin, signup ,signout } from '../controller/auth.controller.js';
import no
const User = require('../model/user.model.js')

const router = express.Router();

router.post("/signup" , signup);
router.post("/signin", signin);
router.post("/google" ,google)
router.get("/signout" ,signout)

router.post("/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Generate reset token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      // Send Email with Reset Link
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Reset Your Password",
        html: `<p>Click <a href="http://localhost:5173/reset-password/${user._id}/${token}">here</a> to reset your password.</p>`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email Error:", error);
          return res.status(500).json({ message: "Error sending email" });
        }
        res.json({ message: "Reset link sent to your email" });
      });
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
  
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) return res.status(400).json({ message: "Invalid or expired token" });
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update user password
      await User.findByIdAndUpdate(id, { password: hashedPassword });
  
      res.json({ message: "Password has been reset successfully!" });
    } catch (error) {
      console.error("Reset Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  

export default router;