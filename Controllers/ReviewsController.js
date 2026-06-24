import express from "express";
import Review from "../Modules/Review.js";
import Doctor from "../Modules/Doctor.js";
import errorHandling from "../Middlewares/ErrorHandling.js";

const router = express.Router();

/* ------------------------------------------------------------------ */
/* Helper: recalculate a doctor's ratingAverage + ratingCount          */
/* based on currently APPROVED reviews only.                          */
/* ------------------------------------------------------------------ */
const recalculateDoctorRating = async (doctorId) => {
  const approvedReviews = await Review.find({
    doctor: doctorId,
    status: "approved",
  });

  const ratingCount = approvedReviews.length;
  const ratingAverage = ratingCount
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
    : 0;

  await Doctor.findByIdAndUpdate(doctorId, {
    ratingAverage: Math.round(ratingAverage * 10) / 10, // 1 decimal place
    ratingCount,
  });
};

/* ------------------------------------------------------------------ */
/* POST /api/reviews/:doctorId  — submit a new review (public)        */
/* No login required — just name + email + rating + comment.          */
/* ------------------------------------------------------------------ */
router.post(
  "/:doctorId",
  errorHandling(async (req, res) => {
    const { doctorId } = req.params;
    const { reviewerName, reviewerEmail, rating, comment } = req.body;

    if (!reviewerName || !reviewerEmail || !rating || !comment) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    try {
      const review = await Review.create({
        doctor: doctorId,
        reviewerName,
        reviewerEmail,
        rating: numericRating,
        comment,
      });

      res.status(201).json({
        message: "Thank you! Your review has been submitted and will appear once approved.",
        review,
      });
    } catch (error) {
      // Duplicate email-for-this-doctor (unique index) → friendly message
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ message: "You've already submitted a review for this doctor." });
      }
      throw error;
    }
  })
);

/* ------------------------------------------------------------------ */
/* GET /api/reviews/:doctorId  — get APPROVED reviews for a doctor     */
/* (public — what the doctor detail page displays)                    */
/* ------------------------------------------------------------------ */
router.get(
  "/:doctorId",
  errorHandling(async (req, res) => {
    const { doctorId } = req.params;

    const reviews = await Review.find({
      doctor: doctorId,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .select("-reviewerEmail"); // never expose emails publicly

    res.json(reviews);
  })
);

/* ------------------------------------------------------------------ */
/* GET /api/reviews/admin/pending  — admin: view pending reviews       */
/* (wire up your existing admin-auth middleware on this route)        */
/* ------------------------------------------------------------------ */
router.get(
  "/admin/pending",
  errorHandling(async (req, res) => {
    const pending = await Review.find({ status: "pending" })
      .populate("doctor", "name specialization")
      .sort({ createdAt: -1 });

    res.json(pending);
  })
);

/* ------------------------------------------------------------------ */
/* GET /api/reviews/admin/all  — admin: view ALL reviews               */
/* Optional ?status=pending|approved|rejected query param to filter.   */
/* Includes reviewerEmail (unlike the public endpoint) since the admin */
/* needs it to spot spam/duplicate accounts. Always includes the       */
/* doctor's name + specialization so the admin knows who it's about.   */
/* ------------------------------------------------------------------ */
router.get(
  "/admin/all",
  errorHandling(async (req, res) => {
    const { status } = req.query;

    const filter = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const reviews = await Review.find(filter)
      .populate("doctor", "name specialization profileImg")
      .sort({ createdAt: -1 });

    res.json(reviews);
  })
);

/* ------------------------------------------------------------------ */
/* PUT /api/reviews/admin/:id/approve                                  */
/* ------------------------------------------------------------------ */
router.put(
  "/admin/:id/approve",
  errorHandling(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.status = "approved";
    await review.save();

    await recalculateDoctorRating(review.doctor);

    res.json({ message: "Review approved", review });
  })
);

/* ------------------------------------------------------------------ */
/* PUT /api/reviews/admin/:id/reject                                   */
/* ------------------------------------------------------------------ */
router.put(
  "/admin/:id/reject",
  errorHandling(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.status = "rejected";
    await review.save();

    await recalculateDoctorRating(review.doctor);

    res.json({ message: "Review rejected", review });
  })
);

/* ------------------------------------------------------------------ */
/* DELETE /api/reviews/admin/:id                                       */
/* ------------------------------------------------------------------ */
router.delete(
  "/admin/:id",
  errorHandling(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const { doctor } = review;
    await Review.findByIdAndDelete(req.params.id);
    await recalculateDoctorRating(doctor);

    res.json({ message: "Review deleted" });
  })
);

export default router;