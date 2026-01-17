const express = require('express');
const {
  createNewVideo,
  getAllVideos,
  getVideoDetails,
  updateVideoThumbnail,
  deleteVideo,
  togglePublishStatus,
  shareVideo,
} = require('../controllers/video.controller');
const verifyJWT = require('../middlewares/auth.middleware');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { upload } = require('../middlewares/multer.middleware');

//router
const videoRouter = express.Router();

//public
videoRouter.get('/', getAllVideos);
videoRouter.get('/:videoId', getVideoDetails);

///this route work with auth or not
videoRouter.get('/:videoId/share', shareVideo);

//private
videoRouter.use(verifyJWT);

videoRouter.post(
  '/',
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  createNewVideo
);
videoRouter.patch(
  '/:videoId',
  upload.fields([{ name: 'thumbnail', maxCount: 1 }]),
  updateVideoThumbnail
);
videoRouter.delete('/:toggle-publish/:videoId', togglePublishStatus);
videoRouter.delete('/:videoId', deleteVideo);

module.exports = videoRouter;
