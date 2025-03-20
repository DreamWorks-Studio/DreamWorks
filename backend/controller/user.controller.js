import User from "../model/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs';
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer'

export const test = (req, res) => {
    res.json({
        message: 'API route is Working !!',
    });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "it23394124@my.sliit.lk",
    pass: "kwjj lgry qadr cbwu"  // Use the generated App Password
  }
});

// Update User
export const UpdateUser = async (req, res, next) => {
    try {
        // Ensure user is updating only their own account
        if (req.user.id !== req.params.id) {
            return next(errorHandler(401, 'You can only update your own account!'));
        }

        // Hash the password if it's being updated
        if (req.body.password) {
            req.body.password = bcryptjs.hashSync(req.body.password, 10);
        }

        // Update user in database
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    avatar: req.body.avatar,
                },
            },
            { new: true } // Return updated user data
        );

        // Ensure user exists before accessing _doc
        if (!updatedUser) {
            return next(errorHandler(404, 'User not found!'));
        }

        // Exclude password from response
        const { password, ...rest } = updatedUser._doc;

        res.status(200).json(rest);
    } catch (error) {
        next(error); // Pass error to middleware
    }
};

// Delete User
export const DeleteUser = async (req, res, next) => {
    try {
        // Ensure user is deleting only their own account
        if (! req.user.isAdmin && req.user.id !== req.params.id) {
            return next(errorHandler(401, "You can delete only your own account!"));
        }

        // Delete user from database
        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
        next(error); // Pass error to middleware
    }
};



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

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
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

export const forgetpassword = async (req, res, next) => {
  const { email } = req.body;
  
  try {
    console.log("Received email:", email);

 
    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

   
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

   
    user.verifyToken = token;
    await user.save();
    console.log("User updated with token:", user);

    
    const mailOptions = {
      from: "bagyasadumina2003@gmail.com",
      to: email,
      subject: "Password Reset",
      text: `Use the following link to reset your password: http://localhost:5173/resetpassword/${user._id}/${token}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ status: 500, message: "Email not sent" });
      }
      res.status(200).json({ status: 200, message: "Email sent successfully" });
    });

  } catch (error) {
    console.error("Forget password error:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export const resetpassword = async (req, res, next) => {
  const { id, token } = req.params;

  try {
    console.log("Reset password request for ID:", id, "with token:", token);

    // Validate user and token
    const validUser = await User.findOne({ _id: id, verifyToken: token });

    if (!validUser) {
      return res.status(404).json({ status: 404, message: "Invalid or expired token" });
    }

    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
        return res.status(401).json({ status: 401, message: "Invalid token" });
      }
      res.status(200).json({ status: 200, message: "Token verified. Proceed with reset." });
    });

  } catch (error) {
    console.error("Error in resetpassword controller:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};


export const updateResetPassword = async (req, res, next) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    console.log("Updating password for user ID:", id);

    // Validate user and token
    const validUser = await User.findOne({ _id: id, verifyToken: token });

    if (!validUser) {
      return res.status(404).json({ status: 404, message: "Invalid or expired token" });
    }

    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
        return res.status(401).json({ status: 401, message: "Invalid token" });
      }

      // Hash the new password
      const newPassword = await bcryptjs.hash(password, 10);
      await User.findByIdAndUpdate(id, { password: newPassword, verifyToken: "" });

      res.status(200).json({ status: 200, message: "Password updated successfully" });
    });

  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
