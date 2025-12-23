import express from "express";
import mongoDbConnection from "./db.js";
import authController from "./Controllers/authController.js";
import DoctorsController from "./Controllers/DoctorsController.js";
import TrainerController from "./Controllers/TrainerController.js";
import VideoCatController from "./Controllers/VideoCatController.js";
import VideoController from "./Controllers/VideoController.js";
import BlogCatController from "./Controllers/BlogCatController.js";
import BlogsController from "./Controllers/BlogsController.js";
import cors from "cors";
import cookieParser from "cookie-parser";

mongoDbConnection();
const app = express();

// ✅ 1. CORS first - Allow all origins dynamically
app.use(
  cors({
    origin: true, // dynamically reflect the requesting origin
    credentials: true, // allow sending cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ✅ 2. Parse JSON and URL-encoded data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ 3. Cookie parser
app.use(cookieParser());

// ✅ 4. Routes
app.use("/api/auth", authController);
app.use("/api/doctors", DoctorsController);
app.use("/api/trainers", TrainerController);
app.use("/api/videoscat", VideoCatController);
app.use("/api/video", VideoController);
app.use("/api/blogcategory", BlogCatController);
app.use("/api/blogs", BlogsController);

// ✅ 5. Start server
app.listen(8000, "0.0.0.0", () => {
  console.log("App listening at http://0.0.0.0:8000");
});
