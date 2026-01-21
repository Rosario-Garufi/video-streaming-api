const mongoose = require('mongoose');
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

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log(req.params);
  const userIdToUse = userId || req.user._id;

  if (!userIdToUse) {
    throw new ApiError(400, 'User id is required');
  }

  const isOwner = req.user._id.toString() === userIdToUse.toString();

  //if not the owner we return only the public playlist
  const matchCondition = {
    owner: new mongoose.Types.ObjectId(userIdToUse),
    ...(isOwner ? {} : { isPublic: true }),
  };
  const playlist = await Playlist.aggregate([
    {
      $match: matchCondition,
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'videos',
        foreignField: '_id',
        as: 'videos',
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
              thumbnail: 1,
              duration: 1,
              views: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        videoCount: {
          $size: '$videos',
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Playlist fetched successfully'));
});

//!@DESC: Get info abaut a specific playlist
//@route: GET /api/v1/playlists/:playlist
//Access: Public

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, 'Playlist id is required');
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'videos',
        foreignField: '_id',
        as: 'videos',

        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              as: 'owner',
              foreignField: '_id',
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
                {
                  $addFields: {
                    owner: { $first: '$owner' },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: '$owner' },
        videoCount: { $size: '$videos' },
      },
    },
  ]);

  if (!playlist.length) {
    throw new ApiError(404, 'Playlist not found');
  }

  const playlistData = playlist[0];
  //check if playlist is private and user is not the owner

  if (
    !playlistData.isPublic &&
    (!req.user || playlistData.owner._id.toString() !== req.user._id.toString())
  ) {
    throw new ApiError(403, 'You not have permission to view this playlist');
  }

  return res
    .status(200)
    .json(new ApiResponse(playlistData, 'Playlist fetched successfully'));
});

//!@DESC: remove video from a playlist
//@route: DELETE /api/v1/playlists/:playlist/videos/:videoId
//Access: Private

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, 'Playlist id and videoId are required');
  }

  const updatePlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id,
      videos: new mongoose.Types.ObjectId(videoId),
    },
    {
      $pull: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      new: true,
    }
  );

  if (!updatePlaylist) {
    throw new ApiError(
      404,
      'Playlist not found or video not present in playlist'
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatePlaylist, 'Video removed successfully'));
});

//!@DESC: update playlist details
//@route: PATCH /api/v1/playlists/:playlist
//Access: Private

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description, isPublic = false } = req.body;

  const update = {};
  if (name !== undefined) update.name = name;
  if (description !== undefined) update.description = description;
  if (isPublic !== undefined) update.isPublic = isPublic;
  //find playlist and update
  const updatePlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id,
    },
    update,

    { new: true }
  );

  if (!updatePlaylist) {
    throw new ApiError(404, 'Playlist not found or you are not the owner');
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatePlaylist, 'Playlist updated successfully')
    );
});

//!@DESC: delete playlist
//@route: DELETE /api/v1/playlists/:playlist
//Access: Private

const removePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, 'PlaylistId is required');
  }

  //delete playlist if created of the user
  const deletedPlaylist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: req.user._id,
  });

  if (!deletedPlaylist) {
    throw new ApiError(404, 'Playlist not found for you not have permission');
  }

  return res
    .status(200)
    .json(new ApiError(200, {}, 'Playlist deleted successfully'));
});

module.exports = {
  createPlaylist,
  addVideotoPlaylist,
  getUserPlaylists,
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
  removePlaylist,
};
