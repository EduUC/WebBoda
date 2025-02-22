const axios = require('axios');
const supabase = require('./supabaseClient');
require('dotenv').config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;

let accessToken = '';

// 📌 Obtener el refresh token desde Supabase
async function getRefreshToken() {
    const { data, error } = await supabase
        .from('tokens')
        .select('refresh_token')
        .eq('service', 'spotify')
        .single();

    if (error) {
        console.error("❌ Error al obtener el refresh token:", error);
        return null;
    }

    return data.refresh_token;
}

// 📌 Guardar el refresh token en Supabase
async function saveRefreshToken(refreshToken) {
    const { error } = await supabase
        .from('tokens')
        .upsert([{ service: 'spotify', refresh_token: refreshToken }]);

    if (error) {
        console.error("❌ Error al guardar el refresh token:", error);
    } else {
        console.log("💾 Refresh token guardado en Supabase.");
    }
}

// 📌 Refrescar el token de acceso usando el refresh token de Supabase
async function refreshAccessToken() {
    try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
            console.log("⚠️ No hay refresh token disponible. Se requiere autenticación.");
            return null;
        }

        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
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

        // 📌 Guardar el nuevo refresh token si Spotify envía uno nuevo
        if (response.data.refresh_token) {
            await saveRefreshToken(response.data.refresh_token);
        }

        return accessToken;
    } catch (error) {
        console.error("❌ Error al refrescar el token:", error.response?.data || error.message);
        return null;
    }
}

// 📌 Verificar si una canción ya está en la playlist
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

// 📌 Agregar una canción a la playlist de Spotify
async function agregarCancionAPlaylist(songId) {
    try {
        if (!accessToken) {
            console.log("🔄 Intentando refrescar el token...");
            const newAccessToken = await refreshAccessToken();
            if (!newAccessToken) {
                return { error: "🔒 Usuario no autenticado en Spotify." };
            }
        }

        const existe = await verificarCancionEnPlaylist(songId);
        if (!existe) {
            const response = await axios.post(
                `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
                { uris: [`spotify:track:${songId}`] },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            return { message: "✅ Canción agregada!" };
        } else {
            return { message: "⚠️ La canción ya está en la playlist." };
        }
    } catch (error) {
        console.error("❌ Error al agregar la canción:", error.response?.data || error.message);
        return { error: "Error al agregar la canción" };
    }
}

module.exports = { agregarCancionAPlaylist, refreshAccessToken, saveRefreshToken };
