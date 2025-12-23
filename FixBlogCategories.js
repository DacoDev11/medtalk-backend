import mongoose from "mongoose";
import Blogs from "./Modules/Blogs.js"; // Adjust path as needed

const fixCategories = async () => {
  try {
    await mongoose.connect("YOUR_MONGODB_CONNECTION_STRING");
    
    const allBlogs = await Blogs.find({});
    
    console.log(`Found ${allBlogs.length} blogs to check`);
    
    for (let blog of allBlogs) {
      // Check if categoryId is a valid ObjectId
      if (blog.categoryId && typeof blog.categoryId === 'string') {
        console.log(`Fixing blog: ${blog.title}`);
        // The string is already an ObjectId, just needs to be converted
        blog.categoryId = mongoose.Types.ObjectId(blog.categoryId);
        await blog.save();
      }
    }
    
    console.log("✅ All blogs fixed!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

fixCategories();