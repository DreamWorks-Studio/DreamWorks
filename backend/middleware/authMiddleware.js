import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(errorHandler(401, "No token provided!"));
  }

  const token = authHeader.split(" ")[1];

  console.log("🔍 Received Token:", token); // Debugging

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ Token verification failed:", err);
      return next(errorHandler(403, "Token is not valid!"));
    }

    req.user = user;
    next();
  });
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return next(errorHandler(403, "Access Denied: Admins only!"));
  }
  next();
};
