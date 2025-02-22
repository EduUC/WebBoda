const { agregarCancionAPlaylist, saveSpotifyTokens } = require('../services/spotifyClient');
const axios = require('axios');
const querystring = require('querystring');
// const supabase = require('../config/supabase');

// 📌 Configurar credenciales de Spotify
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;

const addSongToSpotify = async (req, res) => {
    console.log("✅ POST addSpotifySong");
    const { songId } = req.body;
    const result = await agregarCancionAPlaylist(songId);
    res.json(result);
};

const login = (req, res) => {
    const scope = 'playlist-modify-public playlist-modify-private';
    const authUrl = `https://accounts.spotify.com/authorize?` + new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI
    }).toString();
    res.redirect(authUrl);
}

const callback = async (req, res) => {
    const code = req.query.code || null;

    if (!code) {
        return res.status(400).send("❌ No se proporcionó ningún código de autenticación.");
    }

    try {
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                code: code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
                }
            }
        );

        accessToken = tokenResponse.data.access_token;
        refreshToken = tokenResponse.data.refresh_token;

        saveSpotifyTokens(refreshToken, accessToken);

        console.log("✅ Nuevo token de usuario obtenido:", accessToken);
        res.send("✅ Autenticación completada. Ahora puedes cerrar esta ventana.");
    } catch (error) {
        console.error("❌ Error al obtener el token de usuario:", error.response?.data || error.message);
        res.status(500).send("Error al obtener el token de usuario");
    }
}

module.exports = { addSongToSpotify, login, callback };
