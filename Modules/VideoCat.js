import mongoose from 'mongoose';
const { Schema } = mongoose;

const VideoCatSchema = new Schema({
  category: {
    type: String,
    required: true,
    trim: true,
    unique: true, // ✅ prevents duplicate category names
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('VideoCat', VideoCatSchema);
