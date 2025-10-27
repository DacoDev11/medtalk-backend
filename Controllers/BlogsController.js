import express from "express";
import Blogs from "../Modules/Blogs.js";
import errorHandling from "../Middlewares/ErrorHandling.js";

const router = express.Router();

router.post(
  "/createpost",
  errorHandling(async (req, res) => {
    const { title, content, category, slug, meta, featuredImage } = req.body;

    // Check if title already exists
    const checkTitle = await Blogs.findOne({ title });
    if (checkTitle) {
      return res.status(400).json({ message: "Title already exists" });
    }

    // Create new blog post
    const post = await Blogs.create({
      title,
      content,
      category,
      slug,
      meta,
      featuredImage,
    });

    res.status(201).json({ message: "Blog post created successfully", post });
  })
);

// Get all posts
router.get(
  "/getallposts",
  errorHandling(async (req, res) => {
    const allposts = await Blogs.find({}).sort({ date: -1 });
    res.json(allposts);
  })
);

// Get post by slug
router.get(
  "/getpost/:slug",
  errorHandling(async (req, res) => {
    const post = await Blogs.findOne({ slug: req.params.slug });
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

// Update post
router.put(
  "/editposts/:id",
  errorHandling(async (req, res) => {
    const { title, category, content, slug, featuredImage } = req.body;

    const newPostData = {};
    if (title) newPostData.title = title;
    if (category) newPostData.category = category;
    if (content) newPostData.content = content;
    if (slug) newPostData.slug = slug;
    if (featuredImage) newPostData.featuredImage = featuredImage;

    let post = await Blogs.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post = await Blogs.findByIdAndUpdate(req.params.id, { $set: newPostData }, { new: true });
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
