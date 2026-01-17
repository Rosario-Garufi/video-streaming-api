const asyncHandler = require('../utils/asyncHandler');

//!@Desc : upload and publish a new video
//@route POST /api/v1/videos
//Private

const createNewVideo = asyncHandler(async (req, res) => {});

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
  createNewVideo,
  getAllVideos,
  getVideoDetails,
  updateVideoThumbnail,
  deleteVideo,
  togglePublishStatus,
  shareVideo,
};
