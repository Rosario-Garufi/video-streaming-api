const mongoose = require('mongoose');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

//@DESC: Get user notifications with pagination and filtering
//@route: GET /api/v1/notification
//Access: Private

const getUserNotifications = asyncHandler(async (req, res) => {
  //extrat query parameters with default values
  const { page = 1, limit = 10, unreadOnly = false } = req.query;

  //build the base match stage for mongoDB aggregation
  const matchStage = {
    recipient: new mongoose.Types.ObjectId(req.user._id),
  };

  //add read status filter is unreadOnly is true
  if (unreadOnly === 'true') {
    matchStage.read = false;
  }

  //excute aggregation pipeline to get notification
  const notifications = await Notification.aggregate([
    //stage 1: filter notification by recipient
    {
      $match: matchStage,
    },
    //join with user collection to get sender detail
    {
      $lookup: {
        from: 'users',
        localField: 'sender',
        foreignField: '_id',
        as: 'sender',
        pipeline: [
          //select specific field from sender
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
    //stage 3: Conver sender array to single object
    {
      $addFields: {
        sender: { $first: '$sender' },
      },
    },
    //stage 4: sort notification by creation date
    {
      $sort: { createdAt: -1 },
    },
    //stage 5: skip previus pages for pagination
    {
      $skip: (Number(page) - 1) * Number(limit),
    },
    //stage 6 : limit result per page
    {
      $limit: Number(limit),
    },
  ]);

  //get count of undead notification for bedge/counter
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  const totalCount = await Notification.countDocuments({
    recipient: req.user._id,
  });

  //return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,
        totalCount,
        page: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
      'Notification fetched successfully'
    )
  );
});

//@DESC: Mark a single notification as read
//@route: PATCH /api/v1/notification/:notificationId
//Access: Private

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    throw new ApiError(400, 'Notification id is required');
  }

  const notification = await Notification.findByIdAndUpdate(
    {
      _id: notificationId,
      recipient: req.user._id,
    },
    {
      $set: {
        read: true,
      },
    },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  res
    .status(200)
    .json(new ApiResponse(200, notification, 'Notification mark as read'));
});

//@DESC: Mark all user's notifications as read
//@route: GET /api/v1/notification/mark-all-read
//Access: Private
const markAllUserNotificationAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      recipient: req.user._id,
      read: false,
    },
    { $set: { read: true } }
  );

  res.status(200).json(new ApiResponse(200, {}, 'All notification as read!'));
});

//!@DESC: Delete a specific notification
//@route: GET /api/v1/notification/:notificationId
//Access: Private

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    throw new ApiError(400, 'Notification id is required!');
  }

  const notification = await Notification.findByIdAndDelete({
    _id: notificationId,
    recipient: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, 'Notification deleted successfully'));
});

//internal utility function to create a new notification
const createNotification = async (recipientId, senderId, type, content) => {
  try {
    //check is recipient has enabled notifications for this type
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return null;
    }

    //check notification setting
    if (
      (type === 'SUBSCRIPTION' &&
        recipient.notificationSetting?.subscriptionActivity === false) ||
      ((type === 'COMMENT' || type === 'REPLY') &&
        recipient.notificationSetting?.commentActivity === false)
    ) {
      return null;
    }

    //create notification
    const notification = await Notification.create({
      recipient: recipient,
      sender: senderId,
      type,
      content,
    });
    return notification;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllUserNotificationAsRead,
  deleteNotification,
  createNotification,
};
