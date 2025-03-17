const authorizedRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "Unauthorized: No role found" });
        }

        // Check if the user's role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: Access denied" });
        }

        next(); // Proceed if the role is authorized
    };
};

export default authorizedRoles;
