require('dotenv').config(); //load environment variable

const express = require('express');
const config = require('./config');
const connectDB = require('./config/db');

const app = express();

//database connection
connectDB();

//server
app.listen(config.port, () => {
  console.log('Server avviato');
});
