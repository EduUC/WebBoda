// api/spotify/login.js
const { login, callback } = require('../controllers/spotifyController');


module.exports = (req, res) => {
  login(req, res);
};