const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.isSuperAdmin) {
      return res.status(403).json({ message: "Super Admin access required" });
    }
    next();
  };

export default authorizeAdmin