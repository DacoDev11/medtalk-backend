import mongoose from 'mongoose';

const {Schema} = mongoose;

const TrainerSchema = new Schema ({
userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

city: {
    type: String
},
specialization: {
    type: String
},
phone: {
    type: String
},
email: {
    type: String
},
profileImg: {
    type: String,
    required: true
},

bio: {
    type: String
}

})