export const ensureAuthenticated = (req, res, next) => {
  const user = req.session?.user;
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

export const requireRoles = (allowedRoles = []) => (req, res, next) => {
  try {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!allowedRoles || allowedRoles.length === 0) return next();

    const position = String(user.position || "").toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase());

    if (!normalizedAllowed.includes(position)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  } catch (err) {
    console.error("requireRoles error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
