const axios = require('axios');
const fs = require('fs');

module.exports = async (req, res) => {
    const { songId } = req.query;
    const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;

    if (!songId) {
        return res.status(400).json({ error: "ID de canción no proporcionado" });
    }

    try {
        const tokens = JSON.parse(fs.readFileSync('api/tokens.json', 'utf8'));
        const accessToken = tokens.access_token;

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
