const axios = require('axios');
const querystring = require('querystring');
const express = require('express');
const app = express();

// Configura las credenciales de Spotify
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'https://webboda.vercel.app/api/callback'; // Debe ser tu URI de redirección
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;  // ID de la playlist

// Ruta de callback que Spotify llamará después de la autenticación
app.get('/api/callback', async (req, res) => {
    const code = req.query.code; // El código que recibimos de Spotify

    if (!code) {
        return res.status(400).send("❌ No se proporcionó el código de autenticación.");
    }

    try {
        // Obtenemos el access token y el refresh token usando el código de autenticación
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                code: code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
                }
            }
        );

        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;

        // Guardamos el refresh token como una variable de entorno en Vercel
        process.env.SPOTIFY_REFRESH_TOKEN = refreshToken; // Vercel no permitirá guardar esto directamente, pero puedes acceder a esta variable en la siguiente solicitud

        console.log("✅ Tokens obtenidos correctamente!");
        res.send("✅ Autenticación completada. Ahora puedes cerrar esta ventana.");
    } catch (error) {
        console.error("❌ Error al obtener los tokens:", error);
        res.status(500).send("❌ Error al obtener el token de usuario.");
    }
});

module.exports = app;
