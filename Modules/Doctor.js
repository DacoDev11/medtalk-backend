import mongoose from "mongoose";
const { Schema } = mongoose;

const DoctorSchema = new Schema(
  {
    // 🔗 Link doctor profile with auth user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

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
      unique: true,
      sparse: true,
    },
    profileImg: {
      type: String,
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

export default mongoose.model("Doctor", DoctorSchema);
