require('dotenv').config(); //load environment variable

const express = require('express');
const config = require('./config');
const connectDB = require('./config/db');
const userRoute = require('./routes/user.routes');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const channelRoute = require('./routes/channel.route');
const videoRouter = require('./routes/video.routes');
const notificationRoute = require('./routes/notification.route');
const playlistRouter = require('./routes/playlist.routes');
const likeRoute = require('./routes/like.routes');
const commentRoute = require('./routes/comment.routes');

const app = express();

//parse json and cookier
app.use(cookieParser());
app.use(express.json());
//database connection
connectDB();

//****** USER ROUTES ******//
app.use('/api/v1/users', userRoute);

//****** CHANNELS ROUTES ******//
app.use('/api/v1/channels', channelRoute);

//****** VIDEOS ROUTES ******//
app.use('/api/v1/videos', videoRouter);

//****** NOTIFICATION ROUTES ******//
app.use('/api/v1/notifications', notificationRoute);

//****** PLAYLISTS ROUTES ******//
app.use('/api/v1/playlists', playlistRouter);

//****** LIKED ROUTES ******//
app.use('/api/v1/liked', likeRoute);

//****** LIKED ROUTES ******//
app.use('/api/v1/comments', commentRoute);

//Error handle
app.use(notFound);
app.use(errorHandler);

//server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
