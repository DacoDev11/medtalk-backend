// Middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../Modules/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.medtalk_token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    req.user = user; // attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
