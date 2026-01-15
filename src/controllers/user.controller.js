const config = require('../config');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const uploadToCloudinary = require('../utils/cloudinary');
const jwt = require('jsonwebtoken');
//internal utility function to generate JWT tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    //find the user
    const user = await User.findById(userId);
    // if (!user) {
    //   throw new ApiError(404, 'User not found');
    // }

    //access token methods
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('🔥 GENERATE TOKENS ERROR:', error);
    throw new ApiError(500, 'Error generate tokens');
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  //get credenzials from request
  const { email, username, password } = req.body;
  //validation
  if (!email && !username) {
    throw new ApiError(400, 'Email or username are required');
  }

  if (!password) {
    throw new ApiError(400, 'Password is required');
  }

  //find the user either by username / email
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  //check is password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  //generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  //get user without sentitive field
  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  //set cookies
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'strict', //CSRF protection
    secure: config.nodeEnv === 'production',
  };
  //return response

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, { loggedInUser }, 'User logged in successfully')
    );
});

//!@Desc: Logout user and clean tokens
//@Route: POST /api/v1/users/logout
//Access: Public
const logoutUser = asyncHandler(async (req, res) => {
  //Clear refresh token in database
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshAccessToken: null },
    },
    {
      new: true,
    }
  );

  //clear cookie
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.nodeEnv === 'production',
  };

  return res
    .status(200)
    .cookie('accessToken', cookieOptions)
    .cookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, {}, 'User logout successfully'));
});

//!@Desc: refresh access token using refresh token
//@Route: POST /api/v1/users/refresh-token
//Access: Public

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    //get refresh token from cookiees or body;

    const incomingRefreshToken =
      req?.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    //verify the refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      config.refreshTokenSecret
    );

    //find the user with this refresh token
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used');
    }

    //generate new token

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user?._id);

    //set cookies
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
      secure: config.nodeEnv === 'production',
    };

    //return response
    return res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          'Access token refreshed successfully'
        )
      );
  } catch (error) {
    console.log(`Error generate refreshToken ${error.message}`);

    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
});

//!@Desc: change user Password
//@Route: POST /api/v1/users/change-password
//Access: Private

const changePassword = asyncHandler(async (req, res) => {
  //get oldPass and new Pass
  const { oldPassword, newPassword } = req.body;
  console.log('User', req.user);

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'Old password and new password are required');
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, 'Old Password is equal new password');
  }

  //find the user with password
  const user = await User.findById(req?.user._id);
  //check is the old password is correct
  const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isOldPasswordCorrect) {
    throw new ApiError(400, 'Invalid old password');
  }

  //update password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successful'));
});

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
