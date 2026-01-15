const cloudinary = require('cloudinary').v2;
const config = require('../config/index');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.ApiKey,
  api_secret: config.cloudinary.ApiSecret,
});

//uplod media to cloudinary
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    });
    return result;
  } catch (error) {
    console.log(`Error upload to cloudinary ${error}`);
    throw new Error('failed to upload media to cloudinary');
  }
};

//delete media to cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.log(`Error deliting from cloudinary ${error}`);
    throw new Error('failed to deliting media from cloudinary');
  }
};
module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
