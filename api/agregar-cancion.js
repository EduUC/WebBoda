const axios = require('axios');
const querystring = require('querystring');

module.exports = async (req, res) => {
    const { songId } = req.body;

    if (!songId) {
        return res.status(400).json({ error: "ID de canción no proporcionado" });
    }

    let accessToken = process.env.SPOTIFY_ACCESS_TOKEN || '';
    let refreshToken = process.env.SPOTIFY_REFRESH_TOKEN || '';
    const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;

    // Función para refrescar el token de acceso
    async function refreshAccessToken() {
        try {
            if (!refreshToken) {
                console.log("⚠️ No hay refresh token disponible. Se requiere autenticación.");
                return null;
            }

            const response = await axios.post(
                'https://accounts.spotify.com/api/token',
                querystring.stringify({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')
                    }
                }
            );

            accessToken = response.data.access_token;
            console.log("🔄 Token de acceso actualizado:", accessToken);
            return accessToken;
        } catch (error) {
            console.error("❌ Error al refrescar el token:", error.response?.data || error.message);
            return null;
        }
    }

    // Verificar si la canción ya está en la playlist
    async function verificarCancionEnPlaylist(songId) {
        try {
            let url = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=100`;
            let canciones = [];

            while (url) {
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                canciones = canciones.concat(response.data.items);
                url = response.data.next;
            }

            return canciones.some(item => item.track.id === songId);
        } catch (error) {
            console.error("❌ Error al verificar la canción en la playlist:", error.response?.data || error.message);
            return false;
        }
    }

    try {
        if (!accessToken) {
            console.log("🔄 Intentando refrescar el token...");
            const newAccessToken = await refreshAccessToken();
            if (!newAccessToken) {
                return res.status(401).json({ error: "🔒 Usuario no autenticado. Visita /login para autenticarse en Spotify." });
            }
        }

        const existe = await verificarCancionEnPlaylist(songId);
        
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
    } catch (error) {
        console.error("❌ Error al agregar la canción:", error.response?.data || error.message);
        res.status(500).json({ error: "Error al agregar la canción" });
    }
};
