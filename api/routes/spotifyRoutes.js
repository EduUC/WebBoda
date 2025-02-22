const express = require('express');
const router = express.Router();
const { addSongToSpotify } = require('../controllers/spotifyController');

router.post('/add', addSongToSpotify);

module.exports = router;
