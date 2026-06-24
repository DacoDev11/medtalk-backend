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
  profileImg: { type: String },

  // 🆕 Same additional fields as Doctor — collected at registration so
  // the admin has everything to review before approving.
  address: { type: String },
  clinicHours: { type: String },
  mapLink: { type: String },
  expertise: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  education: [
    {
      degree: { type: String },
      institution: { type: String },
      year: { type: String },
    },
  ],
  memberships: { type: [String], default: [] },

  resetToken: { type: String },
  resetTokenExpiry: { type: Date },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);