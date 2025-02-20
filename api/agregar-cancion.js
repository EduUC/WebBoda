res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

if (req.method === "OPTIONS") {
    return res.status(200).end();
}


const axios = require('axios');
const fs = require('fs');

module.exports = async (req, res) => {
    const { songId } = req.body;
    const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;

    if (!songId) {
        return res.status(400).json({ error: "ID de canción no proporcionado" });
    }

    try {
        const { default: axios } = require('axios');
        const refreshAccessToken = require('./refresh-token'); // Importamos la función de refresco

        const accessToken = await refreshAccessToken();
        if (!accessToken) {
            return res.status(500).json({ error: "No se pudo obtener el token de Spotify" });
        }



        // Verificar si la canción ya está en la playlist
        let url = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=100`;
        let canciones = [];

        while (url) {
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            canciones = canciones.concat(response.data.items);
            url = response.data.next;
        }

        const existe = canciones.some(item => item.track.id === songId);

        if (existe) {
            return res.json({ message: "⚠️ La canción ya está en la playlist. No se agregará nuevamente." });
        }

        // Si la canción no está, agregarla a la playlist
        const response = await axios.post(
            `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
            { uris: [`spotify:track:${songId}`] },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        console.log("✅ Canción agregada correctamente:", response.data);
        return res.json({ message: "✅ Canción agregada a la playlist!" });

    } catch (error) {
        console.error("❌ Error al agregar la canción:", error.response?.data || error.message);
        res.status(500).json({ error: "Error al agregar la canción" });
    }
};
