import User from "../model/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs';
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "it23394124@my.sliit.lk",
    pass: "jwnr zezu szkp lgzz", // Use app password
  },
});

// Test Route
export const test = (req, res) => {
  res.json({ message: 'API route is Working !!' });
};

// Update User
export const UpdateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return next(errorHandler(401, 'You can only update your own account!'));
    }

    const updateFields = {
      username: req.body.username,
      email: req.body.email,
      avatar: req.body.avatar,
    };

    if (req.body.password && req.body.password.trim() !== "") {
      updateFields.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) return next(errorHandler(404, 'User not found!'));

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};


// Delete User
export const DeleteUser = async (req, res, next) => {
  try {
    if (!req.user.isAdmin && req.user.id !== req.params.id) {
      return next(errorHandler(401, "You can delete only your own account!"));
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

// Get Users
export const getUser = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to see all users'));
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'asc' ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map(({ _doc }) => {
      const { password, ...rest } = _doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password
export const forgetpassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: 401, message: "User not found" });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    user.verifytoken = token;
    await user.save();

    const mailOptions = {
      from: "sanjana.nim2001@gmail.com",
      to: email,
      subject: "Password Reset",
      text: `Use this link to reset your password: http://localhost:5173/reset-password/${user._id}/${token}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ status: 500, message: "Email not sent" });
      }
      res.status(201).json({ status: 201, message: "Email sent successfully" });
    });
  } catch (error) {
    console.error("Forget password error:", error);
    next(error);
  }
};

// Reset Password (Verify Link)
export const resetpassword = async (req, res, next) => {
  const { id, token } = req.params;

  try {
    const validuser = await User.findOne({ _id: id, verifytoken: token });
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    if (validuser && verifyToken.id) {
      res.status(201).json({ status: 201, validuser });
    } else {
      res.status(401).json({ status: 401, message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

// Update Reset Password
export const updateResetPassword = async (req, res, next) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    const validuser = await User.findOne({ _id: id, verifytoken: token });
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    if (validuser && verifyToken.id) {
      const newpassword = await bcryptjs.hash(password, 10);
      await User.findByIdAndUpdate(id, { password: newpassword });

      res.status(201).json({ status: 201, message: "Password updated successfully" });
    } else {
      res.status(401).json({ status: 401, message: "Invalid or expired token" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
};

// Toggle User Status
export const toggleUserStatus = async (req, res, next) => {
  try {
    // 1. Check if user exists
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return next(errorHandler(404, 'User not found'));
    }

    // 2. Authorization check - only admins/superadmins can change status
    if (!req.user.isAdmin && !req.user.isSuperAdmin) {
      return next(errorHandler(403, 'Unauthorized to change user status'));
    }

    // 3. Prevent self-deactivation
    if (req.user._id.toString() === userToUpdate._id.toString()) {
      return next(errorHandler(400, 'Cannot change your own status'));
    }

    // 4. Prevent modifying super admins (if needed)
    if (userToUpdate.isSuperAdmin && !req.user.isSuperAdmin) {
      return next(errorHandler(403, 'Cannot modify super admin status'));
    }

    // 5. Toggle status with validation
    const newStatus = userToUpdate.status === 'active' ? 'inactive' : 'active';
    userToUpdate.status = newStatus;
    await userToUpdate.save();

    // 6. Return response
    const { password, ...rest } = userToUpdate._doc;
    res.status(200).json({
      success: true,
      message: `User status updated to ${newStatus}`,
      user: rest
    });

  } catch (err) {
    next(err);
  }
};
// controller/user.controller.js
export const toggleAdminPrivileges = async (req, res, next) => {
  try {
    const userToModify = await User.findById(req.params.id);
    if (!userToModify) {
      return next(errorHandler(404, 'User not found'));
    }

    // Debug logs
    console.log('Modifying user:', {
      id: userToModify._id,
      currentAdmin: userToModify.isAdmin,
      currentSuperAdmin: userToModify.isSuperAdmin
    });

    // Only modify if not a superadmin
    if (!userToModify.isSuperAdmin) {
      userToModify.isAdmin = !userToModify.isAdmin;
      await userToModify.save();
    }

    const { password, ...rest } = userToModify._doc;
    
    res.status(200).json({
      success: true,
      message: userToModify.isSuperAdmin 
        ? 'User is a Super Admin' 
        : `User ${userToModify.isAdmin ? 'promoted to admin' : 'demoted to user'}`,
      user: rest
    });
    
  } catch (error) {
    console.error('Controller Error:', error);
    next(error);
  }
};