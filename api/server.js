require('dotenv').config();
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');
const fs = require('fs'); // 📌 Para guardar el refresh token en un archivo

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 📌 Configurar credenciales de Spotify
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/callback';
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;

let accessToken = '';
let refreshToken = '';

// 📌 1️⃣ Cargar el refresh token desde un archivo al iniciar el servidor
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

// 📌 2️⃣ Guardar el refresh token en un archivo
function saveTokens(refreshToken) {
    fs.writeFileSync('tokens.json', JSON.stringify({ refresh_token: refreshToken }));
    console.log("💾 Refresh token guardado en tokens.json.");
}

// 📌 3️⃣ Ruta para iniciar sesión en Spotify
app.get('/login', (req, res) => {
    const scope = 'playlist-modify-public playlist-modify-private';
    const authUrl = `https://accounts.spotify.com/authorize?` + querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI
    });
    res.redirect(authUrl);
});

// 📌 4️⃣ Callback para recibir el token de Spotify
app.get('/callback', async (req, res) => {
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
        saveTokens(refreshToken); // 📌 Guardar el refresh token

        console.log("✅ Nuevo token de usuario obtenido:", accessToken);
        res.send("✅ Autenticación completada. Ahora puedes cerrar esta ventana.");
    } catch (error) {
        console.error("❌ Error al obtener el token de usuario:", error.response?.data || error.message);
        res.status(500).send("Error al obtener el token de usuario");
    }
});

// 📌 5️⃣ Función para refrescar el token automáticamente
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

// 📌 6️⃣ Función para verificar si una canción ya está en la playlist
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

// 📌 7️⃣ Ruta para agregar una canción a la playlist con verificación de duplicados
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

// 📌 8️⃣ Cargar refresh token al iniciar el servidor
loadTokens();

// 📌 9️⃣ Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔗 Autenticación de usuario: http://localhost:${PORT}/login`);
});
