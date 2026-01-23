const mongoose = require('mongoose');
const Like = require('../models/like.model');
const Video = require('../models/video.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

//@Desc: toggle like/unlike on a video
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
    await Promise.all([
      Like.findByIdAndDelete(existingLike._id),
      Video.findByIdAndUpdate(videoId, {
        $inc: {
          likes: -1,
        },
      }),
    ]);
    message = 'Video unliked successfully';
  } else {
    await Promise.all([
      Like.create({
        video: videoId,
        likedBy: req.user._id,
      }),
      Video.findByIdAndUpdate(videoId, {
        $inc: {
          likes: 1,
        },
      }),
    ]);

    message = 'Video liked successfully';
  }
  return res.status(200).json(new ApiResponse(200, {}, message));
});

//@Desc: toggle like/unlike on a comment
//@route POST /api/v1/comments/:commentId/like
//@access Private

const toggleLikeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, 'Comment id is required');
  }

  let message = '';
  //check if comment have a live
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    message = 'Comment unliked successfully';
  } else {
    await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    message = 'Comment liked successfully';
  }

  return res.status(200).json(new ApiResponse(200, {}, message));
});

//@Desc: Get all videos liked by the autenticated user
//@route POST /api/v1/users/liked-videos
//@access Private

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: {
          $exists: true,
        },
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'video',
        foreignField: '_id',
        as: 'video',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
                {
                  $project: {
                    _id: 0,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: '$owner' },
            },
          },
          {
            $project: {
              _id: 0,
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              description: 1,
              video: 1,
              likedAt: '$createdAt',
              owner: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        video: { $first: '$video' },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likedVideos,
        totalLikedVideos: likedVideos.length,
      },
      'Like video fetched successfull'
    )
  );
});

//@Desc: Get all user who liked a specific video
//@route POST /api/v1/videos/:videoId/likes
//@access Private

const getVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, 'Video id is required');
  }

  const likes = await Like.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'likedBy',
        foreignField: '_id',
        as: 'likedBy',
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likedBy: { $first: '$likedBy' },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likes,
        totalLikes: likes.length,
      },
      'Like fetched successfull'
    )
  );
});

//@Desc: Get all user who liked a specific video
//@route POST /api/v1/comments/:commentId/likes
//@access Private

const getCommentLikes = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, 'Comment id is required');
  }

  const likeComment = await Like.aggregate([
    {
      $match: {
        comment: new mongoose.Types.ObjectId(commentId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'likedBy',
        foreignField: '_id',
        as: 'likedBy',
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: { $first: '$likedBy' },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      likeComment,
      totalLikes: likeComment.length,
    })
  );
});

module.exports = {
  toggleLikeVideo,
  toggleLikeComment,
  getVideoLikes,
  getCommentLikes,
  getLikedVideos,
};
