const express = require('express');
const { addSongToSpotify } = require('../controllers/spotifyController');
const { login, callback } = require('../controllers/spotifyController');
const router = express.Router();

router.post('/add', addSongToSpotify);
router.get('/login', login);
router.get('/callback', callback);

module.exports = router;
