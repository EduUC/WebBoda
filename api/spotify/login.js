const { login } = require('../../controllers/spotifyController');

module.exports = (req, res) => {
  login(req, res);
};