const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const supabase = require('./supabase'); // Asegúrate de importar correctamente el cliente de Supabase
const loginRouter = require('./login');  // Importa las rutas de login.js

const app = express();
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'https://webboda.vercel.app/api/callback';  // Cambia esto si usas localhost

// Usa las rutas del login
app.use('/api', loginRouter);  // Se asegura de que las rutas de login estén en /api

// Esta es la ruta de callback que debe ser independiente
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

        const accessToken = tokenResponse.data.access_token;
        const refreshToken = tokenResponse.data.refresh_token;

        // Guarda los tokens en Supabase
        const { data, error } = await supabase
            .from('spotify_tokens')
            .upsert([
                { id: '1', access_token: accessToken, refresh_token: refreshToken, updated_at: new Date() }
            ], { onConflict: ['id'] });

        if (error) throw error;

        console.log("✅ Tokens guardados en Supabase!");

        res.send("✅ Autenticación completada. Tokens guardados correctamente.");
    } catch (error) {
        console.error("❌ Error al obtener los tokens:", error.message);
        res.status(500).send("Error al obtener los tokens.");
    }
});

// Configura el puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
