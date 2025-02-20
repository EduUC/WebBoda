const axios = require('axios');
const fs = require('fs');

module.exports = async (req, res) => {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    try {
        const data = fs.readFileSync('api/tokens.json', 'utf8');
        const tokens = JSON.parse(data);
        const refreshToken = tokens.refresh_token;

        if (!refreshToken) {
            return res.status(401).json({ error: "🔒 No hay refresh token. Visita /api/login" });
        }

        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            `grant_type=refresh_token&refresh_token=${refreshToken}`,
            // querystring.stringify({
            //     grant_type: 'refresh_token',
            //     refresh_token: refreshToken,
            // }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
                }
            }
        );

        res.json({ access_token: response.data.access_token });
    } catch (error) {
        console.error("❌ Error al refrescar el token:", error.response?.data || error.message);
        res.status(500).json({ error: "Error al refrescar el token" });
    }
};
