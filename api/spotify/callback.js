// api/spotify/callback.js
const { login, callback } = require('../controllers/spotifyController');


module.exports = (req, res) => {
  callback(req, res);
};
