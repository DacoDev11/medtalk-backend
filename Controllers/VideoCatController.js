import express from 'express';
import VideoCat from '../Modules/VideoCat.js';
import errorHandling from '../Middlewares/ErrorHandling.js';

const router = express.Router();

router.post('/addVideoCat', async (req, res) => {
  try {
    const { category } = req.body;

    const videoCategory = await VideoCat.create({ category });

    res.json(videoCategory);
  } catch (error) {
    errorHandling(error, req, res);
  }
});


router.get("/getAllCat", async (req, res) => {
    const getCat = await VideoCat.find().sort({createdAt: -1});
    res.json(getCat);
})

export default router;
