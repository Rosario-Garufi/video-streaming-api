const mongoose = require('mongoose');
const Like = require('../models/like.model');
const Video = require('../models/video.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

//!@Desc: toggle like/unlike on a video
//@route POST /api/v1/videos/:videoId/like
//@access Private

const toggleLikeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, 'Video id is required');
  }

  //checked if user alrady like
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
  let message;
  if (existingLike) {
    //remove like
    await Like.findByIdAndDelete(existingLike._id);
    message = 'Video unliked successfully';
  } else {
    await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    message = 'Video liked successfully';
  }
  return res.status(200).json(new ApiResponse(200, {}, message));
});

//!@Desc: toggle like/unlike on a comment
//@route POST /api/v1/comments/:commentId/like
//@access Private

const toggleLikeComment = asyncHandler(async (req, res) => {});

//!@Desc: Get all videos liked by the autenticated user
//@route POST /api/v1/users/liked-videos
//@access Private

const getLikedVideos = asyncHandler(async (req, res) => {});

//!@Desc: Get all user who liked a specific video
//@route POST /api/v1/videos/:videoId/likes
//@access Private

const getVideoLikes = asyncHandler(async (req, res) => {});

//!@Desc: Get all user who liked a specific video
//@route POST /api/v1/comments/:commentId/likes
//@access Private

const getCommentLikes = asyncHandler(async (req, res) => {});

module.exports = {
  toggleLikeVideo,
  toggleLikeComment,
  getVideoLikes,
  getCommentLikes,
  getLikedVideos,
};
