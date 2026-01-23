const Comment = require('../models/comment.model');
const Video = require('../models/video.model');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('./notification.controller');

//!@Desc: Get all comments for a video with pagination and replies
//@route GET /api/v1/videos/:videoId/comments
//@access Public

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(400, 'Video id is required');
  }

  const comment = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
        parentComment: null,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
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
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'parentComment',
        as: 'replies',
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
        owner: { $first: '$owner' },
        repliesComment: { $size: '$replies' },
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (parseInt(page) - 1) * parseInt(limit) },
    { $limit: parseInt(limit) },
  ]);

  //get total comment count
  const totalComment = await Comment.countDocuments({
    video: videoId,
    parentComment: null,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comment,
        totalComment,
        currentPage: parseInt(page),
        totalaPages: Math.ceil(totalComment / parseInt(limit)),
      },
      'Comment fetched successfull'
    )
  );
});

//!@Desc: add a new comment or reply to a video
//@route GET /api/v1/videos/:videoId/comments
//@access Private

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content, parentcommentId } = req.body;

  if (!videoId) {
    throw new ApiError(400, 'videoId is required');
  }

  if (!content || content.trim() == '') {
    throw new ApiError(400, 'comment content is required');
  }

  //crete comment object
  const commentData = {
    content,
    video: videoId,
    owner: req.user._id,
  };
  //add parent comment reference if provided
  if (parentcommentId) {
    //check if parent comment exist
    const parentComment = await Comment.findById(parentcommentId);
    if (!parentComment) {
      throw new ApiError(404, 'Parent comment not found');
    }
    commentData.parentComment = parentcommentId;
  }

  //create comment
  const comment = await Comment.create(commentData);
  //get populated comment
  const populatedComment = await Comment.findById(comment._id).populate(
    'owner',
    'username fullName avatar'
  );

  //send notification
  if (parentcommentId) {
    //reply notification to the owner
    const parentcomment = await Comment.findById(parentcommentId);
    if (
      parentcomment &&
      parentcomment.owner.toString() !== req.user._id.toString()
    ) {
      await createNotification(
        parentcomment.owner,
        req.user._id,
        'REPLY',
        `${req.user.fullName} replied to your comment`
      );
    }
  } else {
    //new notification and notification to video owner
    const video = await Video.findById(videoId);
    if (video && video.owner.toString() !== req.user._id.toString()) {
      await createNotification(
        video.owner,
        req.user._id,
        'COMMENT',
        `${req.user.fullName} comment your video`
      );
    }
  }

  res
    .status(201)
    .json(new ApiResponse(201, populatedComment, 'Comment add successfully'));
});

//!@Desc: update existing comment
//@route PATCH /api/v1/comments/:commentId
//@access Private

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(400, 'Comment id is required');
  }

  if (!content || content.trim() == '') {
    throw new ApiError(400, 'Content is required');
  }

  //check if the comment exist
  const comment = await Comment.findOne({
    _id: commentId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(404, 'Comment not found or you not have permission');
  }

  //update comment
  comment.content = content;

  await comment.save();
  return res
    .status(200)
    .json(new ApiResponse(200, comment, 'Comment update successfully'));
});

//!@Desc: delete a comment and all its replies
//@route DELETE /api/v1/comments/:commentId
//@access Private

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, 'Comment id is required');
  }

  const comment = await Comment.findOne({
    _id: commentId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(404, 'Comment not found or you not have permission');
  }

  //delete comment and replies
  await Promise.all([
    Comment.deleteMany({ parentComment: commentId }),
    Comment.findOneAndDelete(commentId),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Comment deleted successfully'));
});

//!@Desc: Get all replies for a specific comment with pagination
//@route GET /api/v1/comments/:commentId/replies
//@access Public

const getCommentReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!commentId) {
    throw new ApiError(400, 'Comment id is required');
  }

  const replies = await Comment.aggregate([
    {
      $match: {
        parentComment: new mongoose.Types.ObjectId(commentId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
        pipeline: [
          {
            $project: { username: 1, fullName: 1, avatar: 1 },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: '$owner' },
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (Number(page) - 1) * Number(limit) },
    { $limit: Number(limit) },
  ]);

  //get totalReplies
  const totalReplies = await Comment.countDocuments({
    parentComment: commentId,
  });

  //return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          replies,
          currentPage: Number(page),
          totalPages: Math.ceil(totalReplies / Number(limit)),
        },
        'Comment replies fetched successfully'
      )
    );
});

module.exports = {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  getCommentReplies,
};
