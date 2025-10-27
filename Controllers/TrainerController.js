import express from "express";
import Trainer from "../Modules/Trainer.js";
import cloudinaryV2 from "../Cloudinary.js";
import upload from "../Middlewares/ImageFilter.js";

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
})

export default router;
