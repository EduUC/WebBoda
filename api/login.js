const express = require('express');
const querystring = require('querystring');
const router = express.Router();
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;

router.get('/', (req, res) => {
    const scope = 'playlist-modify-public playlist-modify-private';
    const authUrl = `https://accounts.spotify.com/authorize?` + querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI
    });
    res.redirect(authUrl);
});

module.exports = router;
