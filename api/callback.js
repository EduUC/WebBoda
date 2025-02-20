const axios = require('axios');
const querystring = require('querystring');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://webboda.vercel.app/api/callback';

// Aquí obtienes el refresh_token que guardaste anteriormente
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN; // Asegúrate de guardarlo correctamente en las variables de entorno o en una base de datos

const refreshAccessToken = async () => {
    if (REFRESH_TOKEN) {
        console.log("Refrescando el token de acceso...");

        try {
            const response = await axios.post(
                'https://accounts.spotify.com/api/token',
                new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: REFRESH_TOKEN, // Usas el refresh_token guardado
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            const accessToken = response.data.access_token; // Este es el nuevo access_token
            return accessToken; // Devuelves el nuevo access_token
        } catch (error) {
            console.error("❌ Error al refrescar el token:", error.response?.data || error.message);
            return null;
        }
    } else {
        console.log("No se encontró el refresh_token.");
        return null;
    }
};

module.exports = refreshAccessToken;
