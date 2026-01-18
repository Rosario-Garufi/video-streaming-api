const Video = require('../models/video.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require('../utils/cloudinary');
//!@Desc : upload and publish a new video
//@route POST /api/v1/videos
//Private

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description, category, tags } = req.body;

  if (!title || !description || !category) {
    throw new ApiError(400, 'Title, description, category are required');
  }

  //check is files are uploaded
  if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
    throw new ApiError(400, 'Video file, thumbnail are required');
  }

  //get file path
  const videoLocalPath = req?.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req?.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, 'video and thumbnail are required');
  }

  //upload to cloudinary
  const videoUpload = await uploadToCloudinary(
    videoLocalPath,
    'youtube/videos'
  );
  if (!videoUpload) {
    throw new ApiError(500, 'Error uploading video');
  }

  //upload thumbnail
  const thumbnailUpload = await uploadToCloudinary(
    thumbnailLocalPath,
    'youtube/thumbnails'
  );

  if (!thumbnailUpload) {
    await deleteFromCloudinary(videoUpload?.public_id, 'youtube/videos');
    throw new ApiError(500, 'Error thumbnail upload failed');
  }

  //create video document
  const video = await Video.create({
    title,
    description,
    videoFile: {
      public_id: videoUpload?.public_id,
      url: videoUpload?.secure_url,
    },
    thumbnail: {
      public_id: thumbnailUpload?.public_id,
      url: thumbnailUpload?.secure_url,
    },
    duration: videoUpload?.duration || 0,
    owner: req.user._id,
    category,
    tags: tags ? JSON.parse(tags) : [],
  });

  if (video) {
    //return response
    return res
      .status(201)
      .json(new ApiResponse(201, video, 'Video upload successful'));
  } else {
    await Promise.all([
      deleteFromCloudinary(videoUpload.public_id, 'youtube/videos'),
      deleteFromCloudinary(thumbnailUpload.public_id, 'youtube/thumbnails'),
    ]);
    throw new ApiError(500, 'Create video failed');
  }
});

//!@Desc : Get all videos with filtering, sorting and pagination
//@route GET /api/v1/videos?page=1&limit=10$query=tutorials&sortedBy=views&sortType=desc&userId=1234
//Public

const getAllVideos = asyncHandler(async (req, res) => {});

//!@Desc : Get video details
//@route GET /api/v1/videos/:videoId
//Public

const getVideoDetails = asyncHandler(async (req, res) => {});

//!@Desc : update video thumbnail
//@route PATCH /api/v1/videos/:videoId
//Private

const updateVideoThumbnail = asyncHandler(async (req, res) => {});

//!@Desc : delete video
//@route DELETE /api/v1/videos/:videoId
//Private

const deleteVideo = asyncHandler(async (req, res) => {});

//!@Desc :  toggle video publish status (publish/unpublish)
//@route GET /api/v1/videos/:videoId
//Private

const togglePublishStatus = asyncHandler(async (req, res) => {});

//!@Desc :  generate sharing links for a video
//@route GET /api/v1/videos/:videoId
//Private

const shareVideo = asyncHandler(async (req, res) => {});

module.exports = {
  publishVideo,
  getAllVideos,
  getVideoDetails,
  updateVideoThumbnail,
  deleteVideo,
  togglePublishStatus,
  shareVideo,
};
