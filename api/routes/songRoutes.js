const express = require('express');
const router = express.Router();
const { addSong, getSongs } = require('../controllers/songController');

router.post('/', addSong);
router.get('/', getSongs);

module.exports = router;
