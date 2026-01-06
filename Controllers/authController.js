import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../Modules/User.js";
import Doctor from "../Modules/Doctor.js";
import Trainer from "../Modules/Trainer.js";
import errorHandling from "../Middlewares/ErrorHandling.js";
import { sendWelcomeEmail } from '../utils/emailService.js';
import upload from "../Middlewares/ImageFilter.js";
import cloudinaryV2 from "../Cloudinary.js";

const router = express.Router();

/* ------------------------ Helper: Generate JWT ------------------------ */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

/* ------------------------ Register Request ------------------------ */
router.post(
  "/request-register",
  upload.fields([{ name: "profileImg", maxCount: 1 }]),
  errorHandling(async (req, res) => {
    const {
      name,
      email,
      role,
      specialization,
      city,
      phone,
      experience,
      hospital,
      bio,
    } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!["doctor", "trainer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User already exists or request pending" });
    }

    // Handle profile image upload
    let profileImgUrl = "";
    if (req.files && req.files.profileImg) {
      try {
        const uploadedImg = await cloudinaryV2.uploader.upload(
          req.files.profileImg[0].path
        );
        profileImgUrl = uploadedImg.secure_url;
        console.log("✅ Profile image uploaded:", profileImgUrl);
      } catch (error) {
        console.error("❌ Image upload error:", error);
        // Continue without image if upload fails
      }
    }

    const newUser = await User.create({
      name,
      email,
      password: "temporary",
      role,
      isApproved: false,
      createdByAdmin: false,

      // Store submitted profile data
      specialization,
      city,
      phone,
      experience,
      hospital,
      bio,
      profileImg: profileImgUrl,
    });

    res.status(201).json({
      message: "Registration request submitted. Await admin approval.",
      user: newUser,
    });
  })
);

/* ------------------------ Admin: View Requests ------------------------ */
router.get(
  "/requests",
  errorHandling(async (req, res) => {
    const pending = await User.find({ isApproved: false }).select("-password");
    res.json(pending);
  })
);

/* ------------------------ Admin: Approve Request ------------------------ */
/* ------------------------ Admin: Approve Request ------------------------ */
router.put(
  "/requests/:id/approve",
  errorHandling(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Approve user
    user.isApproved = true;

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    try {
      /* ---------------- Doctor Profile ---------------- */
      if (user.role === "doctor") {
        const existingDoctor = await Doctor.findOne({ user: user._id });
        if (!existingDoctor) {
          await Doctor.create({
            user: user._id,
            name: user.name,
            email: user.email,
            specialization: user.specialization || "General",
            experience: user.experience || "Not specified",
            hospital: user.hospital || "Not specified",
            city: user.city || "Not specified",
            phone: user.phone || "Not specified",
            bio: user.bio || "Profile created upon approval",
            profileImg: user.profileImg || "",
            status: "approved",
          });
          console.log("✅ Doctor profile created with image");
        }
      }

      /* ---------------- Trainer Profile ---------------- */
      if (user.role === "trainer") {
        const existingTrainer = await Trainer.findOne({ user: user._id });
        if (!existingTrainer) {
          await Trainer.create({
            user: user._id,
            name: user.name,
            email: user.email,
            specialization: user.specialization || "General Fitness",
            experience: user.experience || "Not specified",
            city: user.city || "Not specified",
            phone: user.phone || "Not specified",
            bio: user.bio || "Profile created upon approval",
            profileImg: user.profileImg || "",
            status: "approved",
          });
          console.log("✅ Trainer profile created with image");
        }
      }

      /* ---------------- Send Welcome Email ---------------- */
      console.log('🚀 Calling sendWelcomeEmail...');
      const emailResult = await sendWelcomeEmail(
        user.email,
        user.name,
        resetToken
      );

      console.log('📬 Email Result:', emailResult);

      if (!emailResult.success) {
        console.error('⚠️ Warning: Profile created but email failed to send');
        console.error('Error details:', emailResult.error);
      } else {
        console.log('✅ Welcome email sent successfully!');
      }

    } catch (error) {
      console.error("❌ Profile creation error:", error);
      return res.status(500).json({
        message: "User approved but profile creation failed",
        error: error.message
      });
    }

    res.json({
      message: "User approved, profile created, and welcome email sent",
      resetToken,
    });
  })
);

/* ------------------------ Admin: Reject Request ------------------------ */
router.put(
  "/requests/:id/reject",
  errorHandling(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(user._id);

    res.json({ message: "User request rejected" });
  })
);

/* ------------------------ Login ------------------------ */
/* ------------------------ Login ------------------------ */
router.post(
  "/login",
  errorHandling(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.isApproved)
      return res.status(403).json({ message: "Account not approved yet" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);

    // ✅ REMOVED cookie - just return token
    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, role: user.role },
      token, // Frontend will store this in localStorage
    });
  })
);

/* ------------------------ Verify Session ------------------------ */
router.get(
  "/verify-session",
  errorHandling(async (req, res) => {
    const token = req.cookies.medtalk_token;
    if (!token) return res.status(401).json({ message: "No session found" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ user });
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  })
);

/* ------------------------ Verify Token (Header) ------------------------ */
router.get(
  "/verify-token",
  errorHandling(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({
        valid: true,
        user: { id: user._id, name: user.name, role: user.role },
      });
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  })
);

/* ------------------------ Reset Password ------------------------ */
router.post(
  "/reset-password",
  errorHandling(async (req, res) => {
    const { token, password } = req.body;

    console.log('🔐 Password reset attempt with token:', token);

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Find user with this reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ Invalid or expired token');
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    console.log('✅ Valid token found for user:', user.email);

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    console.log('✅ Password updated successfully for:', user.email);

    res.json({
      message: "Password reset successful. You can now login with your new password."
    });
  })
);

/* ------------------------ Logout ------------------------ */
router.post("/logout", (req, res) => {
  res.clearCookie("medtalk_token");
  res.json({ message: "Logged out successfully" });
});

/* ------------------------ Create Admin (One-time) ------------------------ */
router.post(
  "/create-admin",
  errorHandling(async (req, res) => {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash("Admin@123", 12);
    await User.create({
      name: "Super Admin",
      email: "admin@medtalks.com",
      password: hashedPassword,
      role: "admin",
      isApproved: true,
      createdByAdmin: true,
    });

    res.status(201).json({
      message: "Admin user created successfully",
      credentials: {
        email: "admin@medtalks.com",
        password: "Admin@123",
      },
    });
  })
);

export default router;