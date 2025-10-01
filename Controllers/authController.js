import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Modules/User.js";
import errorHandling from "../Middlewares/ErrorHandling.js";

const router = express.Router();

// ------------------- Register -------------------
router.post("/register", errorHandling(async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;

  if (!name || !email || !password || !confirmPassword || !role) {
    return res.status(400).json({ message: "Fields with * are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords don't match" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role
  });

  res.status(201).json({ message: "User registered successfully", user: newUser });
}));

// ------------------- Login -------------------
router.post("/login", errorHandling(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    message: "Login successful",
    token,
    user: { id: user._id, name: user.name, role: user.role }
  });
}));

// ------------------- Get All Users -------------------
router.get("/all", errorHandling(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));

// ------------------- Get User by ID -------------------
router.get("/:id", errorHandling(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}));

// ------------------- Delete User -------------------
router.delete("/:id", errorHandling(async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted successfully" });
}));

// ------------------- Update User -------------------
router.put("/:id", errorHandling(async (req, res) => {
  const { name, email, password, role } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (password) updateData.password = await bcrypt.hash(password, 12);
  if (role) updateData.role = role;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true }
  );

  if (!updatedUser) return res.status(404).json({ message: "User not found" });
  res.json(updatedUser);
}));

export default router;
