const querystring = require('querystring');
const express = require('express');
const app = express();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = 'https://webboda.vercel.app/api/callback';  // Cambia esto si usas localhost

app.get('/api/login', (req, res) => {
    const scope = 'playlist-modify-public playlist-modify-private';
    const authUrl = `https://accounts.spotify.com/authorize?` + querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI
    });
    res.redirect(authUrl);
});

module.exports = app;
