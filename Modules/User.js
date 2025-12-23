import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["user", "admin", "doctor", "trainer"],
    default: "user",
  },

  isApproved: { type: Boolean, default: false },
  createdByAdmin: { type: Boolean, default: false },

  // 🔹 TEMPORARY PROFILE DATA (collected at registration)
  specialization: { type: String },
  city: { type: String },
  phone: { type: String },
  experience: { type: String },
  hospital: { type: String },
  bio: { type: String },
  profileImg: { type: String }, // ✅ ADD THIS LINE

  resetToken: { type: String },
  resetTokenExpiry: { type: Date },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);

