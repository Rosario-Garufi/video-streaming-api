const User = require('../models/user.model');
const Video = require('../models/video.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
//!DESC: Get channel profile information
//@route: GET /api/v1/channels/:username

const asyncHandler = require('../utils/asyncHandler');

//@Access: Public
const getChannelInfo = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, 'Username is required');
  }

  const channel = await User.findOne({ username }).select(
    '-password -refreshToken -watchHistory -notificationSettings -email -isVerified'
  );

  if (!channel) {
    throw new ApiError(404, 'Channel not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel, 'Channel successfully'));
});

//!DESC: Update channel profile information and coverImage
//@route: PATCH /api/v1/channels
//@Access: Private
const updateChannelInfo = asyncHandler(async (req, res) => {
  const { channelDescription, channelTags, socialLinks } = req.body;
});

//!DESC: Update channel notification preferences
//@route: PATCH /api/v1/channels/notifications
//@Access: Private
const updateNotificationSetting = asyncHandler(async (req, res) => {});

//!DESC: GET channel vidos with pagination and sorting
//@route: GET /api/v1/channels/:username/videos?page=1&limit=10&sortBy=createdAt&sortType=Desc
//@Access: Private
const getChannelVideos = asyncHandler(async (req, res) => {});

//!DESC: GET channel share
//@route: GET /api/v1/channels/:username/share
//@Access: Private
const getChannelShareLink = asyncHandler(async (req, res) => {});

module.exports = {
  getChannelInfo,
  updateChannelInfo,
  updateNotificationSetting,
  getChannelInfo,
  getChannelShareLink,
};
