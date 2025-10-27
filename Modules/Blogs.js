import mongoose from "mongoose";
const { Schema } = mongoose;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  meta: {
    type: String,
  },
  featuredImage: {
    type: String, // store image URL or file path
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Blogs", postSchema);
