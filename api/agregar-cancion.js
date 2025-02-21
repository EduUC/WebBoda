const express = require('express');
const axios = require('axios');
const supabase = require('./supabase');
const router = express.Router();
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;

router.post('/', async (req, res) => {
    const { songId } = req.body;

    if (!songId) {
        return res.status(400).json({ error: "ID de canción no proporcionado" });
    }

    // Obtiene los tokens desde Supabase
    const tokens = await obtenerTokensDesdeSupabase();
    if (!tokens) {
        return res.status(401).json({ error: "🔒 No se encontraron tokens. Inicia sesión nuevamente en Spotify." });
    }

    // Refrescar el access token si es necesario
    let accessToken = await refreshAccessToken(tokens.refresh_token);
    if (!accessToken) {
        return res.status(401).json({ error: "🔒 No se pudo refrescar el token. Inicia sesión nuevamente en Spotify." });
    }

    // Verifica si la canción ya está en la playlist
    const existe = await verificarCancionEnPlaylist(songId, accessToken);

    if (!existe) {
        console.log(`🎵 Agregando canción ${songId} a la playlist ${PLAYLIST_ID}`);

        const response = await axios.post(
            `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
            { uris: [`spotify:track:${songId}`] },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        console.log("✅ Canción agregada correctamente:", response.data);
        return res.json({ message: "✅ Canción agregada a la playlist!" });
    } else {
        return res.json({ message: "⚠️ La canción ya está en la playlist. No se agregará nuevamente." });
    }
});

module.exports = router;
