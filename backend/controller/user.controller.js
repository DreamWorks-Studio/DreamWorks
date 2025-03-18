import User from "../model/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs';

// Test Route to check if API is working
export const test = (req, res) => {
    res.json({
        message: 'API route is Working !!',
    });
};

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
        if (req.user.id !== req.params.id) {
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