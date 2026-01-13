require("dotenv").config();

const config = {
    port : process.env.PORT || 8000,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    nodeEnv: process.env.NODE_ENV || "development",
    mongoURI: process.env.MONGO_URI,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        ApiKey: process.env.CLOUDINARY_API_KEY,
        ApiSecret: process.env.CLOUDINARY_API_SECRET
    },
    corsOrigin: process.env.CORS_ORIGIN
    
}

module.exports = config