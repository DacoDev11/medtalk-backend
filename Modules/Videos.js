import mongoose from 'mongoose';
const { Schema } = mongoose;

const VideoSchema = new Schema({
  videoCat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoCat',
    required: true,
  },
  videoLink: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Video', VideoSchema);
 