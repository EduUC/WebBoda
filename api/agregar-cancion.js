const axios = require('axios');
const fs = require('fs');

module.exports = async (req, res) => {
    const { songId } = req.body;
    const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;

    if (!songId) {
        return res.status(400).json({ error: "ID de canción no proporcionado" });
    }

    try {
        const tokens = JSON.parse(fs.readFileSync('api/tokens.json', 'utf8'));
        const accessToken = tokens.access_token;

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
