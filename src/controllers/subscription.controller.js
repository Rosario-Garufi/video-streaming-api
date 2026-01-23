const mongoose = require('mongoose');
const Subscription = require('../models/subscription.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('./notification.controller');

//@Desc: Toggle subscription status for a channel (subscrive/unscriver);
//@route POST /api/v1/channels/:channelId/subscribe

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, 'Channel id is required');
  }

  //user can't subscribe on your profile
  if (channelId.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot subscrivbe on your channel!');
  }

  let message = '';

  const subscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (subscription) {
    await Subscription.findByIdAndDelete(subscription._id);
    message = 'Unsubscribed successfully';
  } else {
    await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
    message = 'Subscribed successfully';

    await createNotification(
      channelId,
      req.user._id,
      'SUBSCRIPTION',
      `${req.user._id} subscribe to your channel`
    );
  }

  return res.status(200).json(new ApiResponse(200, {}, message));
});

//@Desc: Get all channels that a user has subscribed to
//@route: GET /api/v1/users/:subscriberId/subscribed-channels
//@Access:Private

const getUSerSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const subscriberIdToUse = subscriberId || req.user._id;
  if (!subscriberIdToUse) {
    throw new ApiError(400, 'Subscriber Id is required!');
  }

  const subscriptions = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberIdToUse),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'channel',
        foreignField: '_id',
        as: 'channelInfo',
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              coverImage: 1,
              channelDescription: 1,
              channelTags: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channelInfo: { $first: '$channelInfo' },
      },
    },
    {
      $project: {
        _id: 0,
        channelInfo: 1,
        subscribeAt: '$createdAt',
      },
    },
  ]);

  //send response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscriptions,
        totalSubscriptions: subscriptions.length,
      },
      'Subscribed channels fetched successfully'
    )
  );
});

//@Desc: Get all subscribers of a channel
//@route: GET /api/v1/channels/:channelId/subscribers
//@Access:Private

const getChannelAllSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const channelIdToUse = channelId || req.user._id;

  if (!channelIdToUse) {
    throw new ApiError('Channel id is required');
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelIdToUse),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'subscriber',
        foreignField: '_id',
        as: 'subscriberInfo',
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
        subscriberInfo: { $first: '$subscriberInfo' },
      },
    },
    {
      $project: {
        _id: 0,
        subscriberInfo: 1,
        subscribedAt: '$createdAt',
      },
    },
  ]);

  //send the response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscribers,
        totalSubscribers: subscribers.length,
      },
      'Channel subscribers fetched successfully'
    )
  );
});

module.exports = {
  toggleSubscription,
  getChannelAllSubscribers,
  getUSerSubscribedChannels,
};
