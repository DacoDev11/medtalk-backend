import express from "express";
import Doctor from "../Modules/Doctor.js";
import errorHandling from "../Middlewares/ErrorHandling.js"
import cloudinaryv2 from "../Cloudinary.js"
import upload from "../Middlewares/ImageFilter.js"

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
})

export default router