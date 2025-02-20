const axios = require('axios');
const express = require('express');
const querystring = require('querystring');
const app = express();

// Configura las credenciales de Spotify
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'https://webboda.vercel.app/api/callback';  // Cambia según tu configuración

// Ruta para manejar el callback de Spotify
app.get('/api/callback', async (req, res) => {
    const code = req.query.code || null;

    if (!code) {
        return res.status(400).send("❌ No se proporcionó ningún código de autenticación.");
    }

    try {
        // Solicita el access token y refresh token de Spotify
        const tokenResponse = await axios.post(
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

        // Guardar los tokens en las variables de entorno de Vercel (solo durante la ejecución)
        const accessToken = tokenResponse.data.access_token;
        const refreshToken = tokenResponse.data.refresh_token;

        // Setear las variables de entorno temporalmente para esta sesión
        process.env.SPOTIFY_ACCESS_TOKEN = accessToken;
        process.env.SPOTIFY_REFRESH_TOKEN = refreshToken;

        console.log("✅ Tokens obtenidos correctamente!");
        console.log('Refresh Token:', refresh_token);
        console.log('Access Token:', access_token);

        res.send("✅ Autenticación completada. Los tokens están guardados correctamente.");
    } catch (error) {
        console.error("❌ Error al obtener los tokens:", error.message);
        res.status(500).send("Error al obtener los tokens.");
    }
});

// Configurar puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
