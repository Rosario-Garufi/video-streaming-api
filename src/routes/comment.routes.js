const express = require('express');
const verifyJWT = require('../middlewares/auth.middleware');
const {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  getCommentReplies,
} = require('../controllers/comment.controller');

const commentRoute = express.Router();

//public
commentRoute.get('/video/:videoId', getVideoComments);
commentRoute.get('/:commentId/replies', getCommentReplies);

//private
commentRoute.use(verifyJWT);
commentRoute.post('/video/:videoId', addComment);
commentRoute.patch('/:commentId', updateComment);
commentRoute.delete('/:commentId', deleteComment);

module.exports = commentRoute;
