const express = require('express');
const verifyJWT = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');
const {
  updateChannelInfo,
  updateNotificationSetting,
  getChannelInfo,
} = require('../controllers/channel.controller');
const {
  getChannelAnalyticsOverview,
  getChannelDetailedAnalytics,
} = require('../controllers/channelAnalytics.controller');

const channelRoute = express.Router();

//!PUBLIC
channelRoute.get('/:username', getChannelInfo);

//!PRIVATE
channelRoute.use(verifyJWT);

channelRoute.patch(
  '/update',
  upload.fields([{ name: 'coverImage', maxCount: 1 }]),
  updateChannelInfo
);

channelRoute.patch('/notification-settings', updateNotificationSetting);

//analytics overview

channelRoute.get('/analytics/overwiew', getChannelAnalyticsOverview);

channelRoute.get('/analytics/details/:channelId', getChannelDetailedAnalytics);

module.exports = channelRoute;
