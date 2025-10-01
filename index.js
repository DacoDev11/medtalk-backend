import express from "express";
import mongoDbConnection from "./db.js";
import authController from "./Controllers/authController.js";
import DoctorsController from "./Controllers/DoctorsController.js"

import cors from "cors"  
import Doctor from "./Modules/Doctor.js";
mongoDbConnection() 
const app = express()
app.use(express.json()) 
app.use(cors())

 
app.use("/api/auth", authController)
app.use("/api/doctors", DoctorsController)
   
app.listen(8000,"0.0.0.0", () => {
    console.log("App listing at http://0.0.0.0:8000"); 
}) 
   