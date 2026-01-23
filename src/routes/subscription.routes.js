const express = require('express');
const verifyJWT = require('../middlewares/auth.middleware');
const {
  toggleSubscription,
  getChannelAllSubscribers,
  getUSerSubscribedChannels,
} = require('../controllers/subscription.controller');

const subscriptionRouter = express.Router();
subscriptionRouter.use(verifyJWT);
//Toggle subscription (subscribe/unsubscribe)
subscriptionRouter.post('/toggle/:channelId', toggleSubscription);

// Get user's subscribed channels
subscriptionRouter.get('/user/channels', getUSerSubscribedChannels);

subscriptionRouter.get(
  '/user/:subscriberId/channels',
  getUSerSubscribedChannels
);

// Get channel subscribers
subscriptionRouter.get('/channel/subscribers', getChannelAllSubscribers);

subscriptionRouter.get(
  '/channel/:channelId/subscribers',
  getChannelAllSubscribers
);

module.exports = subscriptionRouter;
