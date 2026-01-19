const express = require('express');
const verifyJWT = require('../middlewares/auth.middleware');
const {
  getUserNotifications,
  markAllUserNotificationAsRead,
  markNotificationAsRead,
  deleteNotification,
  createNotification,
} = require('../controllers/notification.controller');

const notificationRoute = express.Router();

//this file have only private route
notificationRoute.use(verifyJWT);

notificationRoute.get('/', getUserNotifications);
notificationRoute.patch('/mark-all-read', markAllUserNotificationAsRead);
notificationRoute.patch('/:notificationId', markNotificationAsRead);
notificationRoute.delete('/:notificationId', deleteNotification);

module.exports = notificationRoute;
