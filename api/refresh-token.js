const axios = require('axios');

const refreshAccessToken = async () => {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
    const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: REFRESH_TOKEN,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        return response.data.access_token;
    } catch (error) {
        console.error("❌ Error al refrescar el token:", error.response?.data || error.message);
        return null;
    }
};

module.exports.handler = async (event, context) => {
    const accessToken = await refreshAccessToken();

    if (!accessToken) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error al obtener el token de Spotify" }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ access_token: accessToken }),
    };
};
