const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

likeSchema.pre('save', function (next) {
  if (!this.video && !this.comment) {
    const error = new Error('A like must refer to either a video or a comment');
    return next(error);
  }

  if (this.video && this.comment) {
    const error = new Error(
      'A like mut refer to either a video or comment, but not both'
    );
    return next(error);
  }
});

likeSchema.index(
  {
    video: 1,
    likedBy: 1,
  },
  { unique: true, sparse: true }
);

likeSchema.index(
  {
    comment: 1,
    likedBy: 1,
  },
  { unique: true, sparse: true }
);

const Like = mongoose.model('Like', likeSchema);
module.exports = Like;
