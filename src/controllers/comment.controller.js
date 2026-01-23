const Comment = require('../models/comment.model');
const Video = require('../models/video.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('./notification.controller');

//!@Desc: Get all comments for a video with pagination and replies
//@route GET /api/v1/videos/:videoId/comments
//@access Public

const getVideoComments = asyncHandler(async (req, res) => {});

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

const updateComment = asyncHandler(async (req, res) => {});

//!@Desc: delete a comment and all its replies
//@route DELETE /api/v1/comments/:commentId
//@access Private

const deleteComment = asyncHandler(async (req, res) => {});

//!@Desc: Get all replies for a specific comment with pagination
//@route GET /api/v1/comments/:commentId/replies
//@access Public

const getCommentReplies = asyncHandler(async (req, res) => {});

module.exports = {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  getCommentReplies,
};
