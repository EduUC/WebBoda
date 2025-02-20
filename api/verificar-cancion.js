res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

if (req.method === "OPTIONS") {
    return res.status(200).end();
}


const axios = require('axios');
const fs = require('fs');


module.exports = async (req, res) => {
    const { songId } = req.query;
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


        let url = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=100`;
        let canciones = [];

        while (url) {
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            canciones = canciones.concat(response.data.items);
            url = response.data.next; // Si hay más canciones, sigue iterando
        }

        const existe = canciones.some(item => item.track.id === songId);

        res.json({ exists: existe });
    } catch (error) {
        console.error("❌ Error al verificar la canción en la playlist:", error.response?.data || error.message);
        res.status(500).json({ error: "Error al verificar la canción en la playlist" });
    }
};
