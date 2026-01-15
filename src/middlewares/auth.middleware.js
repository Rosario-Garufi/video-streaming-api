//Middleware to authenticate user using JWT

const config = require('../config');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');
const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    let token;
    token =
      req?.cookies?.accessToken ||
      (req.headers && req?.headers?.authorization?.split(' ')?.[1]);
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
    //special handling for logout request
    if (req.path === '/logout') {
      //Clear cookie with all required
      const cookieOptions = {
        httpOnly: true,
        sameSite: 'Strict',
        secure: config.nodeEnv === 'production',
        path: '/',
        expires: new Date(0),
      };
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(200).json({
        success: true,
        message: 'Logour successfully',
        date: {},
      });
    }
    throw new ApiError(401, error.message || 'Invalid access token');
  }
});

module.exports = verifyJWT;
