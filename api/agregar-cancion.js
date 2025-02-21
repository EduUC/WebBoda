const axios = require('axios');
const express = require('express');
const querystring = require('querystring');
const supabase = require('./supabase'); // Asegúrate de que esta línea esté presente para importar el cliente de Supabase
const app = express();

// Configura las credenciales de Spotify
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;

// Middleware para procesar cuerpos JSON
app.use(express.json());

// Función para refrescar el access token usando el refresh token
async function refreshAccessToken(refreshToken) {
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

        const newAccessToken = response.data.access_token;

        // 🟢 Guardar el nuevo access token en Supabase
        const { error } = await supabase
            .from('spotify_tokens')
            .update({ access_token: newAccessToken, updated_at: new Date() })
            .eq('id', '1');

        if (error) {
            console.error("❌ Error al actualizar el access token en Supabase:", error.message);
        } else {
            console.log("✅ Nuevo access token guardado en Supabase.");
        }

        return newAccessToken;
    } catch (error) {
        console.error("❌ Error al refrescar el token:", error.response?.data || error.message);
        return null;
    }
}

// Función para verificar si la canción ya está en la playlist
async function verificarCancionEnPlaylist(songId, accessToken) {
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

// Ruta para agregar una canción a la playlist con verificación de duplicados
app.post('/api/agregar-cancion', async (req, res) => {
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

// Configurar puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Función para obtener los tokens desde Supabase
async function obtenerTokensDesdeSupabase() {
    const { data, error } = await supabase
        .from('spotify_tokens')
        .select('access_token, refresh_token')
        .eq('id', '1') // Asegúrate de que este ID coincide con el que guardaste en callback.js
        .single();

    if (error || !data) {
        console.error("❌ Error al obtener los tokens desde Supabase:", error?.message || "No se encontraron tokens.");
        return null;
    }

    return data;
}
