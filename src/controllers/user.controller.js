const asyncHandler = require('../utils/asyncHandler');

//!@Desc:Register a new user with optional avatar and cover Image
//@Route: POST /api/v1/users/register
//Access: Public

const registerUser = asyncHandler(async (req, res) => {});

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
