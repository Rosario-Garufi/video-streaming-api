//Middleware to authenticate user using JWT

const asyncHandler = require('../utils/asyncHandler');

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    console.log(req?.cookies);
  } catch (error) {}
});

module.exports = verifyJWT;
