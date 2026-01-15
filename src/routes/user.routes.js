const express = require('express');
const cookieParser = require('cookie-parser');
const {
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
} = require('../controllers/user.controller');
const { upload } = require('../middlewares/multer.middleware');
const verifyJWT = require('../middlewares/auth.middleware');

const userRoute = express.Router();

//!public
//@register
userRoute.post(
  '/register',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  registerUser
);
//@login
userRoute.post('/login', loginUser);

//@logout
userRoute.post('/refresh-token', refreshAccessToken);

//@password reset route
userRoute.post('/request-password-reset', requestPasswordReset);
userRoute.post('/reset-password', resetPassword);

//private
//!Protected routes ()
userRoute.use(verifyJWT);
userRoute.post('/logout', logoutUser);

userRoute.get('/current-user', getCurrentUSer);

userRoute.patch('/change-password', changePassword);

userRoute.patch('/update-account', updateUserProfile);

//avatar and cover image route
userRoute.patch('/avatar', upload.single('avatar'), updateUserAvatar);

userRoute.patch(
  '/cover-image',
  upload.single('coverImage'),
  updateUserCoverImage
);

//channel routes
userRoute.get('/c/:username', getUserChannelProfile);
userRoute.get('/history', getWatchHistory);

module.exports = userRoute;
