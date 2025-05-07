import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import User from '../model/user.model.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return next(errorHandler(401, 'Unauthorized'));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(errorHandler(401, 'Unauthorized'));
    }
    req.user = user;
    next();
  });
};

export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export const verifySuperAdmin = (req, res, next) => {
  console.log('Decoded Token User:', req.user); // Debug log
  
  if (!req.user?.isSuperAdmin) {
    console.error('Missing superadmin privileges for user:', {
      userId: req.user?.id,
      isAdmin: req.user?.isAdmin,
      isSuperAdmin: req.user?.isSuperAdmin
    });
    return next(errorHandler(403, 'Super Admin access required'));
  }
  next();
};

export const updateLastActive = async (req, res, next) => {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, {
        lastActive: new Date(),
      });
    }
  } catch (err) {
    console.error("Failed to update lastActive:", err);
  }
  next();
};
