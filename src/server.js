require("dotenv").config() //load environment variable
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000

//server
app.listen(PORT, () => {
    console.log("Server avviato")
})

