const Playlist = require('../models/playlist.model');
const Video = require('../models/video.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require('../utils/cloudinary');

//!@DESC: Post create a new playlist
//@route: POST /api/v1/playlists
//Access: Private

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, isPublic = false } = req.body;
  if (!name || name.trim() === '') {
    throw new ApiError(400, 'Name playlist required');
  }

  //create playlist
  const playlist = await Playlist.create({
    name,
    description: description ?? '',
    owner: req.user._id,
    isPublic: Boolean(isPublic),
  });

  if (playlist) {
    return res
      .status(201)
      .json(new ApiResponse(201, playlist, 'Playlist create successfully'));
  } else {
    throw new ApiError(400, 'Create playlist failed');
  }
});

//!@DESC: add a video to a playlist
//@route: POST /api/v1/playlists/:playlistId/videos/:videoId
//Access: Private

const addVideotoPlaylist = asyncHandler(async (req, res) => {
  const playlistId = req?.params?.playlistId;
  const videoId = req?.params?.videoId;

  if (!playlistId || !videoId) {
    throw new ApiError(400, 'Playlist Id and VideoId are required');
  }

  //add video on playlist
  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: req.user._id,
  });
  if (!playlist) {
    throw new ApiError(404, 'Playlist not found');
  }

  //check is video exist
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, 'Video not found');
  }

  //update the playlist

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  ).populate('videos', 'title videoFile thumbnail');

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, 'Video added successfully'));
});

//!@DESC: Get user's videos with video info
//@route: GET /api/v1/users/:userId/playlists
//Access: Public

const getUserPlaylists = asyncHandler(async (req, res) => {});

//!@DESC: Get info abaut a specific playlist
//@route: GET /api/v1/playlists/:playlist
//Access: Public

const getPlaylistById = asyncHandler(async (req, res) => {});

//!@DESC: remove video from a playlist
//@route: DELETE /api/v1/playlists/:playlist/videos/:videoId
//Access: Private

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {});

//!@DESC: update playlist details
//@route: PATCH /api/v1/playlists/:playlist
//Access: Private

const updatePlaylist = asyncHandler(async (req, res) => {});

//!@DESC: delete playlist
//@route: DELETE /api/v1/playlists/:playlist
//Access: Private

const removePlaylist = asyncHandler(async (req, res) => {});

module.exports = {
  createPlaylist,
  addVideotoPlaylist,
  getUserPlaylists,
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
  removePlaylist,
};
