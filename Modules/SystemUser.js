import mongoose from "mongoose";
const { Schema } = mongoose;

const SystemUserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    cnic: {
        type: String,
        required: true
    },
    img: {
        type: String 
    },
    password: {
        type: String,
        required: true
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    },
    
})

export default mongoose.model("System User", SystemUserSchema)