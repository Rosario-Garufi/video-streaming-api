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

//private
playlistRouter.use(verifyJWT);

playlistRouter.post('/', createPlaylist);
playlistRouter.patch('/:playlistId', updatePlaylist);
playlistRouter.get('/:playlistId', getPlaylistById);

playlistRouter.get('/user/:userId', getUserPlaylists);
//add & remove video from playlist
playlistRouter.put('/:playlistId/add/videos/:videoId', addVideotoPlaylist);
playlistRouter.put(
  '/:playlistId/remove/videos/:videoId',
  removeVideoFromPlaylist
);

//delete playlist
playlistRouter.delete('/:playlistId', removePlaylist);

module.exports = playlistRouter;
