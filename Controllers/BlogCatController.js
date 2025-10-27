import express from "express";
import BlogCat from "../Modules/BlogCat.js";


const router = express.Router();

router.post("/addBlogCat", async (req, res) => {
  try {
    const { blogCat } = req.body;

    // Check if the field is provided
    if (!blogCat || blogCat.trim() === "") {
      return res.status(400).json({ message: "Blog category is required" });
    }

    // Create new category
    const newBlogCat = await BlogCat.create({
      blogCategory: blogCat, // Assign the value correctly
    });

    res.status(201).json({
      message: "Blog category added successfully",
      category: newBlogCat,
    });
  } catch (error) {
    console.error("Error adding blog category:", error);
    res.status(500).json({ message: "Server error while adding blog category" });
  }
});

router.get("/getAllBlogCat", async (req, res) => {
    const getBlogCat = await BlogCat.find().sort({createdAt: -1});
    res.json(getBlogCat);
})


export default router;