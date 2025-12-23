import express from "express";
import Blogs from "../Modules/Blogs.js";
import errorHandling from "../Middlewares/ErrorHandling.js";
import uploadFile from "../Middlewares/ImageFilter.js";
import { v2 as cloudinaryv2 } from "cloudinary";

const router = express.Router();

// Create post
router.post(
  "/createpost",
  uploadFile.single("featuredImage"),
  errorHandling(async (req, res) => {
    const { title, content, categoryId, slug, meta } = req.body;

    if (!title || !content || !categoryId || !slug) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const checkTitle = await Blogs.findOne({ title });
    if (checkTitle) {
      return res.status(400).json({ message: "Title already exists" });
    }

    let featuredImageUrl = "";
    if (req.file) {
      try {
        const uploadedImage = await cloudinaryv2.uploader.upload(req.file.path);
        featuredImageUrl = uploadedImage.secure_url;
      } catch (err) {
        console.error("Error uploading image to Cloudinary:", err);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    const post = await Blogs.create({
      title,
      content,
      categoryId,
      slug,
      meta,
      featuredImage: featuredImageUrl,
    });

    // ✅ Populate and send back
    const populatedPost = await Blogs.findById(post._id).populate("categoryId", "blogCategory");

    res.status(201).json({
      message: "Blog post created successfully",
      post: populatedPost,
    });
  })
);

// Get all posts
router.get(
  "/getallposts",
  errorHandling(async (req, res) => {
    const allposts = await Blogs.find({})
      .populate("categoryId", "blogCategory")
      .sort({ date: -1 });
    res.json(allposts);
  })
);

// Get post by slug
router.get(
  "/getpost/:slug",
  errorHandling(async (req, res) => {
    const post = await Blogs.findOne({ slug: req.params.slug }).populate("categoryId", "blogCategory");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  })
);

// Delete post
router.delete(
  "/delposts/:id",
  errorHandling(async (req, res) => {
    const post = await Blogs.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted successfully" });
  })
);

// ✅ FIXED: Update post
router.put(
  "/editposts/:id",
  errorHandling(async (req, res) => {
    const { title, categoryId, content, slug, meta, featuredImage } = req.body;

    const newPostData = {};
    if (title) newPostData.title = title;
    if (categoryId) newPostData.categoryId = categoryId;
    if (content) newPostData.content = content;
    if (slug) newPostData.slug = slug;
    if (meta) newPostData.meta = meta;
    if (featuredImage) newPostData.featuredImage = featuredImage;

    let post = await Blogs.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post = await Blogs.findByIdAndUpdate(
      req.params.id,
      { $set: newPostData },
      { new: true }
    ).populate("categoryId", "blogCategory");

    res.json({ message: "Post updated successfully", post });
  })
);

// Count posts
router.get(
  "/blogCount",
  errorHandling(async (req, res) => {
    const postCount = await Blogs.countDocuments({});
    res.json(postCount);
  })
);

export default router;