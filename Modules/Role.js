import mongoose from "mongoose";
const { Schema } = mongoose;

const RoleSchema = new Schema ({
    role: {
        type: String,
        required: true,
    }
})

export default mongoose.model("Role", RoleSchema)