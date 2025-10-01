import mongoose from "mongoose";
const { Schema } = mongoose;

const DoctorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    hospital: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      unique: true, // doctors shouldn't repeat email
      sparse: true, // allow multiple without email
    },
    profileImg: {
      type: String, // Cloudinary URL
    },
    bio: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // if admin adds directly, it's approved
    },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", DoctorSchema);
