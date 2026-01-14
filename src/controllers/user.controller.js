const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const uploadToCloudinary = require('../utils/cloudinary');

//!@Desc:Register a new user with optional avatar and cover Image
//@Route: POST /api/v1/users/register
//Access: Public

const registerUser = asyncHandler(async (req, res) => {
  //get user detaild from request
  const { username, email, fullName, password } = req.body;

  //validator
  if (!username || !email || !fullName || !password) {
    throw new ApiError(400, 'username, email, fullName, password are required');
  }

  //check if the user already exist
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, 'User already exist');
  }

  //upload avatar if provided
  let avatarLocalPath;
  let avatarUpload = {};
  if (req.files && req.files.avatar && req.files.avatar[0]?.path) {
    avatarLocalPath = req.files.avatar[0].path;
    const uploadResult = await uploadToCloudinary(
      avatarLocalPath,
      'youtube/avatars'
    );
    if (!uploadResult) {
      throw new ApiError(500, 'Error uploading avatar');
    }
    avatarUpload = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    };
  }

  //upload coverImage if provided
  let coverImageLocalPath;
  let coverImageUpload = {};
  if (req.files && req.files.coverImage && req.files.coverImage[0]?.path) {
    coverImageLocalPath = req.files.coverImage[0].path;
    const uploadResult = await uploadToCloudinary(
      coverImageLocalPath,
      'youtube/cover-images'
    );
    if (!uploadResult) {
      throw new ApiError(500, 'Error uploading cover-image');
    }
    coverImageUpload = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    };
  }

  //create the user
  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: Object.keys(avatarUpload).length > 0 ? avatarUpload : undefined,
    coverImage:
      Object.keys(coverImageUpload).length > 0 ? coverImageUpload : undefined,
  });

  // Remove password and refresh token from response
  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  if (!createdUser) {
    throw new ApiError(500, 'Error registering user');
  }

  //return the response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, 'User register successful'));
});

//!@Desc: Login user and generate token
//@Route: POST /api/v1/users/login
//Access: Public

const loginUser = asyncHandler(async (req, res) => {});

//!@Desc: Logout user and clean tokens
//@Route: POST /api/v1/users/logout
//Access: Public
const logoutUser = asyncHandler(async (req, res) => {});

//!@Desc: refresh access token using refresh token
//@Route: POST /api/v1/users/refresh-token
//Access: Public

const refreshAccessToken = asyncHandler(async (req, res) => {});

//!@Desc: change user Password
//@Route: POST /api/v1/users/change-password
//Access: Private

const changePassword = asyncHandler(async (req, res) => {});

//!@Desc: get current user
//@Route: GET /api/v1/users/current
//Access:  Private

const getCurrentUSer = asyncHandler(async (req, res) => {});

//!@Desc: update account detail
//@Route: POST /api/v1/users/current
//Access:  Private

const updateUserProfile = asyncHandler(async (req, res) => {});

//!@Desc: update user's avatar
//@Route: PATCH /api/v1/users/avatar
//Access:  Private

const updateUserAvatar = asyncHandler(async (req, res) => {});

//!@Desc: update user's cover image
//@Route: GET /api/v1/users/cover-image
//Access:  Private

const updateUserCoverImage = asyncHandler(async (req, res) => {});

//!@Desc: Get user's channel profile with subscription details
//@Route: GET /api/v1/users/channel
//Access:  Public

const getUserChannelProfile = asyncHandler(async (req, res) => {});

//!@Desc: Get user's watch history
//@Route: GET /api/v1/users/watch-history
//Access:  Private

const getWatchHistory = asyncHandler(async (req, res) => {});

//!@Desc: Request password reset email
//@Route: POST /api/v1/users/request-reset-password
//Access:  Private

const requestPasswordReset = asyncHandler(async (req, res) => {});

//!@Desc: Reset password using reset token
//@Route: POST /api/v1/users/reset-password/:token
//Access:  Private

const resetPassword = asyncHandler(async (req, res) => {});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUSer,
  updateUserAvatar,
  updateUserCoverImage,
  updateUserProfile,
  getUserChannelProfile,
  getWatchHistory,
  requestPasswordReset,
  resetPassword,
};
