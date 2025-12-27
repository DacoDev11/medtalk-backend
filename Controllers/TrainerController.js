import express from "express";
import Trainer from "../Modules/Trainer.js";
import User from "../Modules/User.js";
import cloudinaryV2 from "../Cloudinary.js";
import upload from "../Middlewares/ImageFilter.js";
import errorHandling from "../Middlewares/ErrorHandling.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
  "/addTrainer",
  upload.fields([{ name: "profileImg", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        name,
        specialization,
        experience,
        city,
        phone,
        email,
        bio,
      } = req.body;

      if (!name || !specialization || !experience || !city) {
        return res.status(400).json({ message: "Please fill all required fields." });
      }

      let profImg = "";
      if (req.files && req.files.profileImg) {
        const uploadedProfileImg = await cloudinaryV2.uploader.upload(
          req.files.profileImg[0].path
        );
        profImg = uploadedProfileImg.secure_url;
      }

      const newTrainer = await Trainer.create({
        name,
        specialization,
        experience,
        city,
        phone,
        email,
        bio,
        profileImg: profImg,
      });

      res.status(201).json({
        success: true,
        message: "Trainer added successfully",
        data: newTrainer,
      });
    } catch (error) {
      console.error("Error adding trainer:", error);
      res.status(500).json({
        success: false,
        message: "Error adding trainer",
        error: error.message,
      });
    }
  }
);

router.get("/getTrainers", async (req, res) => {
  const allTrain = await Trainer.find();
  res.json(allTrain)
});

// Get My Profile (Trainer) - For logged-in trainer to view their own profile
// Get My Profile (Trainer) - For logged-in trainer to view their own profile
router.get(
  "/my-profile",
  errorHandling(async (req, res) => {
    // ✅ Get token from Authorization header instead of cookie
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || user.role !== 'trainer') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Find trainer profile
      const trainer = await Trainer.findOne({ user: user._id });

      if (!trainer) {
        return res.status(404).json({ message: "Trainer profile not found" });
      }

      res.json(trainer);
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  })
);

// Get Single Trainer by ID
router.get("/getTrainerById/:id", async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ success: false, message: "Trainer not found" });
    }

    res.status(200).json({ success: true, data: trainer });
  } catch (error) {
    console.error("Error fetching trainer:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Update Trainer by ID
router.put(
  "/updateTrainer/:id",
  upload.fields([{ name: "profileImg", maxCount: 1 }]),
  async (req, res) => {
    try {
      const updates = { ...req.body };

      // Handle image update if provided
      if (req.files && req.files.profileImg) {
        const uploadedProfile = await cloudinaryV2.uploader.upload(
          req.files.profileImg[0].path
        );
        updates.profileImg = uploadedProfile.secure_url;
      }

      const updatedTrainer = await Trainer.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      );

      if (!updatedTrainer)
        return res
          .status(404)
          .json({ success: false, message: "Trainer not found" });

      res.status(200).json({
        success: true,
        message: "Trainer updated successfully",
        data: updatedTrainer,
      });
    } catch (error) {
      console.error("Error updating trainer:", error);
      res.status(500).json({
        success: false,
        message: "Error updating trainer",
        error: error.message,
      });
    }
  }
);

// Delete Trainer by ID
router.delete("/deleteTrainer/:id", async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ success: false, message: "Trainer not found" });
    }

    // Optional: If using Cloudinary, you can delete image here later if needed

    await Trainer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Trainer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting trainer:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting trainer",
      error: error.message,
    });
  }
});

export default router;