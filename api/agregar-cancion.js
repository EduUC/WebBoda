require('dotenv').config();
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');  // Para guardar el refresh token

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar credenciales de Spotify
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'https://webboda.vercel.app/api/callback';  // URL del callback (modifica si usas localhost)
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;

let accessToken = '';
let refreshToken = '';

// Función para cargar el refresh_token desde el archivo
function loadTokens() {
    try {
        const data = fs.readFileSync('tokens.json', 'utf8');
        const tokens = JSON.parse(data);
        refreshToken = tokens.refresh_token || '';
        console.log("🔄 Refresh token cargado desde el archivo.");
    } catch (error) {
        console.log("⚠️ No hay refresh token guardado. Se requiere autenticación.");
    }
}

// Función para guardar el refresh_token en un archivo
function saveTokens(refreshToken) {
    fs.writeFileSync('tokens.json', JSON.stringify({ refresh_token: refreshToken }));
    console.log("💾 Refresh token guardado en tokens.json.");
}

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
                    'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
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

// Función para verificar si una canción ya está en la playlist
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

// Ruta para agregar una canción a la playlist
app.post('/api/agregar-cancion', async (req, res) => {
    const { songId } = req.body;

    if (!songId) {
        return res.status(400).json({ error: "ID de canción no proporcionado" });
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
});

// Cargar refresh token al iniciar el servidor
loadTokens();

module.exports = app;
