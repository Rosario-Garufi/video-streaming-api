//!DESC: Get channel profile information
//@route: GET /api/v1/channels/:username

const asyncHandler = require('../utils/asyncHandler');

//@Access: Public
const getChannelInfo = asyncHandler(async (req, res) => {});

//!DESC: Update channel profile information and coverImage
//@route: PATCH /api/v1/channels
//@Access: Private
const updateChannelInfo = asyncHandler(async (req, res) => {});

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
