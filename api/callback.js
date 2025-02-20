const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');
const express = require('express');
const app = express();

// Configura las credenciales de Spotify
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'https://webboda.vercel.app/api/callback';  // Asegúrate de que la URL sea la correcta
const saveTokens = (refreshToken) => {
    fs.writeFileSync('tokens.json', JSON.stringify({ refresh_token: refreshToken }));
    console.log("💾 Refresh token guardado.");
};

// Ruta de callback que Spotify llamará después de la autenticación
app.get('/api/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send("❌ No se proporcionó el código de autenticación.");
    }

    try {
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

        // Guarda el refresh token
        saveTokens(refreshToken);

        console.log("✅ Tokens obtenidos correctamente!");
        res.send("✅ Autenticación completada. Ahora puedes cerrar esta ventana.");
    } catch (error) {
        console.error("❌ Error al obtener los tokens:", error);
        res.status(500).send("❌ Error al obtener el token de usuario.");
    }
});

module.exports = app;
