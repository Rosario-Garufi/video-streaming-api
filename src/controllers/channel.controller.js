const User = require('../models/user.model');
const Video = require('../models/video.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
//!DESC: Get channel profile information
//@route: GET /api/v1/channels/:username

const asyncHandler = require('../utils/asyncHandler');
const {
  deleteFromCloudinary,
  uploadToCloudinary,
} = require('../utils/cloudinary');

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

  //prepare update object
  const updateDate = {};

  if (channelDescription !== undefined) {
    updateDate.channelDescription = channelDescription;
  }

  if (channelTags !== undefined) {
    (updateDate.channelDescription = channelDescription),
      (updateDate.channelTags = Array.isArray(channelTags)
        ? channelTags
        : JSON.parse(channelTags));
  }

  if (socialLinks !== undefined) {
    updateDate.socialLinks =
      typeof socialLinks === 'object' ? socialLinks : JSON.parse(socialLinks);
  }

  //upload coverImage
  let coverImageUpdate = {};

  if (req?.files?.coverImage?.length > 0) {
    const coverImageLocalPath = req?.files?.coverImage[0].path;
    //remove old cover image
    if (req?.user?.coverImage) {
      await deleteFromCloudinary(req?.user?.coverImage?.public_id, '/image');
    }

    //add new cover
    const uploadResult = await uploadToCloudinary(
      coverImageLocalPath,
      'youtube/cover-images'
    );
    if (!uploadResult) {
      throw new ApiError('500', 'Error upload cover image');
    }

    coverImageUpdate.coverImage = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    };
  }
  //merge update
  const updateObject = {
    ...updateDate,
    ...coverImageUpdate,
  };

  //update User
  const updateUser = await User.findByIdAndUpdate(
    req?.user?._id,
    updateObject,
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updateUser, ' channel update successfull'));
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
