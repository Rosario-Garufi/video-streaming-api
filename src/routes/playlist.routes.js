const express = require('express');
const verifyJWT = require('../middlewares/auth.middleware');
const {
  createPlaylist,
  addVideotoPlaylist,
  getUserPlaylists,
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
  removePlaylist,
} = require('../controllers/playlist.controller');
addVideotoPlaylist;
const playlistRouter = express.Router();

//public
playlistRouter.get('/:playlistId', getPlaylistById);

//private
playlistRouter.use(verifyJWT);

playlistRouter.post('/', createPlaylist);

playlistRouter.patch('/:playlistId', updatePlaylist);

//add & remove video from playlist
playlistRouter.put('/:playlistId/videos/:videoId', addVideotoPlaylist);
playlistRouter.get('/user/:userId', getUserPlaylists);

playlistRouter.delete('/:playlistId/videos/:videoId', removeVideoFromPlaylist);

//delete playlist
playlistRouter.delete('/:playlistId', removePlaylist);

module.exports = playlistRouter;
