import mongoose from "mongoose";
const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Reviewer info — no login required.
    // If the reviewer happens to be a logged-in user, we still just store
    // name/email they provide (kept simple, no auth dependency here).
    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    reviewerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // Reviews start as "pending" so spam/abuse doesn't go live instantly.
    // Only "approved" reviews are returned by the public GET endpoint.
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// One review per email per doctor — prevents trivial duplicate spam.
ReviewSchema.index({ doctor: 1, reviewerEmail: 1 }, { unique: true });

export default mongoose.model("Review", ReviewSchema);