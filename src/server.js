require('dotenv').config(); //load environment variable

const express = require('express');
const config = require('./config');
const connectDB = require('./config/db');
const userRoute = require('./routes/user.routes');
const cookieParser = require('cookie-parser');

const app = express();

//parse json and cookier
app.use(cookieParser());
app.use(express.json());
//database connection
connectDB();

//****** USER ROUTES ******//
app.use('/api/v1/users', userRoute);

//server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
