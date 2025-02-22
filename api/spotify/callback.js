// api/spotify/callback.js
const { callback } = require('../../controllers/spotifyController');

module.exports = (req, res) => {
  callback(req, res);
};
