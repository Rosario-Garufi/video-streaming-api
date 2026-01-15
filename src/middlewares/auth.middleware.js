//Middleware to authenticate user using JWT

const config = require('../config');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');
const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req?.headers('Authorization').replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized request');
    }

    //vrify token
    const decodedToken = jwt.verify(token, config.accessTokenSecret);

    //get the user from database
    const user = await User.findById(decodedToken._id).select(
      '-password -refreshToken'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid access token');
    }

    //add the user to request object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid access token');
    console.log('Decode JWT failed ', error);
  }
});

module.exports = verifyJWT;
