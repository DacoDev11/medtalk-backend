import mongoose from "mongoose";
const { Schema } = mongoose;

const TrainerSchema = new Schema(
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
    city: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    profileImg: {
      type: String, // e.g. Cloudinary or local upload path
    },
    bio: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Trainer", TrainerSchema);
