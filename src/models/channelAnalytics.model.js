const mongoose = require('mongoose');

const channelAnalyticsSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    totalScribers: {
      type: Number,
      default: 0,
    },
    totalVideos: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    totalComments: {
      type: Number,
      default: 0,
    },
    dailyStats: [
      {
        date: {
          type: Date,
          required: true,
        },
        views: {
          type: Number,
          default: 0,
        },
        subscriberGained: {
          type: Number,
          default: 0,
        },
        subscriberLost: {
          type: Number,
          default: 0,
        },
        likes: {
          type: Number,
          default: 0,
        },
        comments: {
          type: Number,
          default: 0,
        },
      },
    ],
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
  next();
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

const Channelanalytics = mongoose.model('Like', channelAnalyticsSchema);
module.exports = Channelanalytics;
