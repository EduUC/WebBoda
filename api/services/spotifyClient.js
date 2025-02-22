const axios = require('axios');
const supabase = require('./supabaseClient');
require('dotenv').config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;

let accessToken = '';
const tokenId = 'a0f63176-9996-40a8-a5ec-11f9c29fb83f';

// 📌 Obtener el refresh token desde Supabase
async function getRefreshToken() {
    const { data, error } = await supabase
        .from('spotify_tokens')
        .select('refresh_token')  // Seleccionamos el campo 'refresh_token'
        .eq('id', tokenId);  // Filtramos por el id específico

    if (error || !data.length) {
        console.error("❌ Error al obtener el refresh token:", error);
        return null;
    }

    return data[0].refresh_token; 
}


async function getAccessToken() {
    const { data, error } = await supabase
        .from('spotify_tokens')
        .select('access_token')  // Seleccionamos el campo 'refresh_token'
        .eq('id', tokenId);  // Filtramos por el id específico

    if (error || !data.length) {
        console.error("❌ Error al obtener el access token:", error);
        return null;
    }

    return data[0].access_token; 
}

// 📌 Guardar el refresh token en Supabase
async function saveSpotifyTokens(refreshToken, accessToken) {
    const { data, error } = await supabase
        .from('spotify_tokens')
        .update({ access_token: accessToken, refresh_token: refreshToken })  // Actualizamos los tokens
        .eq('id', tokenId);  // Filtramos por el id específico

    if (error) {
        console.error("❌ Error al actualizar en Supabase:", error.message);
        return res.status(500).send("Error al actualizar en la base de datos.");
    } else {
        console.log("✅ Spotify Tokens de usuario actualizados en la base de datos.");
    }
}

async function saveRefreshToken(refreshToken) {
    const { data, error } = await supabase
        .from('spotify_tokens')
        .update({ refresh_token: refreshToken }) 
        .eq('id', tokenId); 

    if (error) {
        console.error("❌ Error al actualizar en Supabase:", error.message);
        return res.status(500).send("Error al actualizar en la base de datos.");
    } else {
        console.log("✅ refreshToken actualizado en la base de datos.");
    }
}

async function saveAccessToken(accessToken) {
    const { data, error } = await supabase
        .from('spotify_tokens')
        .update({ access_token: accessToken })  
        .eq('id', tokenId); 

    if (error) {
        console.error("❌ Error al actualizar en Supabase:", error.message);
        return res.status(500).send("Error al actualizar en la base de datos.");
    } else {
        console.log("✅ AccessToken actualizado en la base de datos.");
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

        await saveAccessToken(response.data.access_token);

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
        console.log("🔄 Intentando refrescar el token...");
        accessToken = await refreshAccessToken();
        if (!accessToken) {
            return { error: "🔒 Usuario no autenticado en Spotify." };
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

module.exports = { agregarCancionAPlaylist, refreshAccessToken, saveSpotifyTokens };
