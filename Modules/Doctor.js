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

    // 🆕 Clinic / address details (shown in Clinic Info card)
    address: {
      type: String, // e.g. "1st Floor, Samha Plaza, Behind Safeer Hypermarket, Ajman, UAE"
    },
    clinicHours: {
      type: String, // e.g. "Open Today, 08:00 - 23:00" (kept simple as free text for now)
    },
    mapLink: {
      type: String, // Google Maps URL for "Get Directions"
    },

    // 🆕 Profile depth fields (Okadoc-style accordion sections)
    expertise: {
      type: [String], // e.g. ["Newborn Care", "Childhood Vaccinations", "Growth Disorders"]
      default: [],
    },
    languages: {
      type: [String], // e.g. ["English", "Hindi", "Arabic"]
      default: [],
    },
    education: [
      {
        degree: { type: String }, // e.g. "MD - Paediatrics"
        institution: { type: String }, // e.g. "Pandit BD Sharma PGIMS"
        year: { type: String }, // e.g. "2006"
      },
    ],
    memberships: {
      type: [String], // e.g. ["Indian Academy of Paediatrics"]
      default: [],
    },

    // 🆕 Review aggregates (kept on the doctor doc for fast reads;
    // recalculated whenever a review is approved/deleted)
    ratingAverage: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", DoctorSchema);