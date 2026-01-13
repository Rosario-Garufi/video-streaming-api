const mongoose = require("mongoose")
const config = require(".")
const connectDB = async() => {
    try {
       const conn = await mongoose.connect(config.mongoURI);
        console.log(`Database Connesso: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error connecting to MongoDb: ${error.message}`)
        process.exit(1)
    }
}

module.exports = connectDB