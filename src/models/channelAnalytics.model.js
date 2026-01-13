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

//index for faster lookups
channelAnalyticsSchema.index({
  channel: 1,
});

const Channelanalytics = mongoose.model('Like', channelAnalyticsSchema);
module.exports = Channelanalytics;
