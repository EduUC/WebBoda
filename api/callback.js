const axios = require('axios');
const querystring = require('querystring');

module.exports = async (req, res) => {
    const code = req.query.code || null;

    if (!code) {
        return res.status(400).send("❌ No se proporcionó ningún código de autenticación.");
    }

    try {
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                code: code,
                redirect_uri: process.env.REDIRECT_URI,
                grant_type: 'authorization_code'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')
                }
            }
        );

        const accessToken = tokenResponse.data.access_token;
        const refreshToken = tokenResponse.data.refresh_token;

        // Guardar el refresh token y access token como variables de entorno
        process.env.SPOTIFY_ACCESS_TOKEN = accessToken;
        process.env.SPOTIFY_REFRESH_TOKEN = refreshToken;

        console.log("✅ Nuevo token de usuario obtenido:", accessToken);
        res.send("✅ Autenticación completada. Ahora puedes cerrar esta ventana.");
    } catch (error) {
        console.error("❌ Error al obtener el token de usuario:", error.response?.data || error.message);
        res.status(500).send("Error al obtener el token de usuario");
    }
};
