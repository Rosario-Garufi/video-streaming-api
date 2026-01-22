const Comment = require('../models/comment.model');
const Video = require('../models/video.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

//!@Desc: Get all comments for a video with pagination and replies
//@route GET /api/v1/videos/:videoId/comments
//@access Public

const getVideoComments = asyncHandler(async (req, res) => {});

//!@Desc: add a new comment or reply to a video
//@route GET /api/v1/videos/:videoId/comments
//@access Private

const addComment = asyncHandler(async (req, res) => {});

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
