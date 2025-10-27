import express from "express";
import mongoDbConnection from "./db.js";
import authController from "./Controllers/authController.js";
import DoctorsController from "./Controllers/DoctorsController.js"
import TrainerController from "./Controllers/TrainerController.js"
import VideoCatController from "./Controllers/VideoCatController.js"
import VideoController from "./Controllers/VideoController.js";
import cors from "cors"  
import Doctor from "./Modules/Doctor.js";
import BlogCatController from "./Controllers/BlogCatController.js"
import BlogsController from "./Controllers/BlogsController.js"

mongoDbConnection() 
const app = express()
app.use(express.json()) 
app.use(cors())

 
app.use("/api/auth", authController)
app.use("/api/doctors", DoctorsController)
app.use("/api/trainers", TrainerController)
app.use("/api/videoscat", VideoCatController)
app.use("/api/video", VideoController)
app.use("/api/blogcategory", BlogCatController)
app.use("/api/blogs", BlogsController)

   
app.listen(8000,"0.0.0.0", () => {
    console.log("App listing at http://0.0.0.0:8000"); 
}) 
   