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

const createPlaylist = asyncHandler(async (req, res) => {});

//!@DESC: add a video to a playlist
//@route: POST /api/v1/playlists/:playlistId/videos/:videoId
//Access: Private

const addVideotoPlaylist = asyncHandler(async (req, res) => {});

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
