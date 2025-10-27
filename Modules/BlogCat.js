import mongoose from "mongoose";

// ✅ Always destructure Schema from mongoose
const { Schema } = mongoose;

const blogCatSchema = new Schema(
  {
    blogCategory: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true } // optional but recommended
);

const BlogCat = mongoose.model("BlogCat", blogCatSchema);

export default BlogCat;
