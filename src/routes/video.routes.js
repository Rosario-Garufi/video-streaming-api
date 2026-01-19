const express = require('express');
const {
  getAllVideos,
  getVideoDetails,
  updateVideoThumbnail,
  deleteVideo,
  togglePublishStatus,
  shareVideo,
  publishVideo,
} = require('../controllers/video.controller');
const verifyJWT = require('../middlewares/auth.middleware');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { upload } = require('../middlewares/multer.middleware');

//router
const videoRouter = express.Router();

//public
videoRouter.get('/', getAllVideos);

///this route work with auth or not
videoRouter.get('/:videoId/share', shareVideo);

//private
videoRouter.use(verifyJWT);
videoRouter.get('/:videoId', getVideoDetails);

videoRouter.post(
  '/',
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  publishVideo
);
videoRouter.patch(
  '/:videoId',
  upload.single('thumbnail'),
  updateVideoThumbnail
);
videoRouter.patch('/toggle-publish/:videoId', togglePublishStatus);
videoRouter.delete('/:videoId', deleteVideo);

module.exports = videoRouter;
