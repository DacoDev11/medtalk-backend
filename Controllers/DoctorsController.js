import express from "express";
import Doctor from "../Modules/Doctor.js";
import User from "../Modules/User.js"; // ✅ ADD THIS
import errorHandling from "../Middlewares/ErrorHandling.js";
import cloudinaryv2 from "../Cloudinary.js";
import upload from "../Middlewares/ImageFilter.js";
import jwt from "jsonwebtoken"; // ✅ ADD THIS

const router = express.Router();

router.post(
  "/addDoctor",
  upload.fields([{ name: "profileImg", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        name,
        specialization,
        experience,
        hospital,
        city,
        phone,
        email,
        bio,
      } = req.body;

      if (!name || !specialization || !experience || !city) {
        return res
          .status(400)
          .json({ message: "Please fill all required fields" });
      }

      let profImg;
      if (req.files && req.files.profileImg) {
        const uploadProfileImg = await cloudinaryv2.uploader.upload(
          req.files.profileImg[0].path
        );
        profImg = uploadProfileImg.secure_url;
      }

      const newDoctor = await Doctor.create({
        name,
        specialization,
        experience,
        hospital,
        city,
        phone,
        email,
        bio,
        profileImg: profImg,
      });

      res.status(201).json(newDoctor);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error adding doctor", error });
    }
  }
);

router.get("/getAllDocs", async (req, res) => {
    const allDocs = await Doctor.find()
    res.json(allDocs)
});

// GET single doctor by ID
router.get("/getDocById/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching doctor", error: error.message });
  }
});

// UPDATE doctor
router.put(
  "/updateDoctor/:id",
  upload.fields([{ name: "profileImg", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Handle new image upload if provided
      if (req.files && req.files.profileImg) {
        const uploadProfileImg = await cloudinaryv2.uploader.upload(
          req.files.profileImg[0].path
        );
        updates.profileImg = uploadProfileImg.secure_url;
      }

      const updatedDoctor = await Doctor.findByIdAndUpdate(id, updates, {
        new: true,
      });

      if (!updatedDoctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      res.json(updatedDoctor);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating doctor", error });
    }
  }
);

// Get My Profile (Doctor) - For logged-in doctor to view their own profile
// Get My Profile (Doctor) - For logged-in doctor to view their own profile
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

      if (!user || user.role !== 'doctor') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Find doctor profile
      const doctor = await Doctor.findOne({ user: user._id });

      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      res.json(doctor);
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  })
);

// DELETE doctor by ID
router.delete("/deleteDoctor/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Optionally: If you want to delete image from Cloudinary too
    // (only if you store public_id, which you currently don't)
    // You can skip this part safely.

    await Doctor.findByIdAndDelete(id);

    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ message: "Error deleting doctor", error: error.message });
  }
});

export default router;