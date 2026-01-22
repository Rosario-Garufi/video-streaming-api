const express = require('express');
const verifyJWT = require('../middlewares/auth.middleware');
const {
  toggleLikeVideo,
  toggleLikeComment,
  getVideoLikes,
  getCommentLikes,
  getLikedVideos,
} = require('../controllers/like.controller');

const likeRoute = express.Router();

//public

//private

likeRoute.use(verifyJWT);

likeRoute.post('/toggle/video/:videoId', toggleLikeVideo);
likeRoute.post('/toggle/comment/:commentId', toggleLikeComment);

likeRoute.get('/videos/:videoId', getVideoLikes);
likeRoute.get('/videos', getLikedVideos);

likeRoute.get('/comment/:commentId', getCommentLikes);

module.exports = likeRoute;
