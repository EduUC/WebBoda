const querystring = require('querystring');

module.exports = async (req, res) => {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const REDIRECT_URI = process.env.REDIRECT_URI || 'https://webboda.vercel.app/api/callback';
    // const REDIRECT_URI = 'http://localhost:3000/callback';

    const scope = 'playlist-modify-public playlist-modify-private';
    const authUrl = `https://accounts.spotify.com/authorize?` + querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI
    });
    res.redirect(authUrl);
};
