import express from 'express';
import Videos from '../Modules/Videos.js';

const router = express.Router();

// Add a new video
router.post('/addVideo', async (req, res) => {
  try {
    const { videoCat, videoLink } = req.body;

    if (!videoCat || !videoLink) {
      return res.status(400).json({ message: 'Please provide both category and video link' });
    }

    const newVideo = await Videos.create({
      videoCat,
      videoLink,
    });

    res.status(201).json(newVideo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding video', error });
  }
});

// Get all videos
router.get('/getAllVids', async (req, res) => {
  try {
    const getVideos = await Videos.find()
      .populate('videoCat') // ✅ populate category name
      .sort({ createdAt: -1 });

    res.status(200).json(getVideos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching videos', error });
  }
});

export default router;
