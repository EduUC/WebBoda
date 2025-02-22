// api/spotify/add.js
const { addSongToSpotify } = require('../controllers/spotifyController');

module.exports = (req, res) => {
  addSongToSpotify(req, res);
};
