const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');

//configure storage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  fileName: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalName);
    cb(null, file.fielfname + '_' + uniqueSuffix + ext);
  },
});

//file filter
const fileFilter = (req, file, cb) => {
  //accept videos and images
  if (
    file.mimetype.startsWith('video/') ||
    file.mimetype.startsWith('image/')
  ) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only vide and images are allowed'));
  }
};

//export multer middleware

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

module.exports = upload;
