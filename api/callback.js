module.exports = async (req, res) => {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
    const REDIRECT_URI = process.env.REDIRECT_URI || 'https://webboda.vercel.app/api/callback';
    
    const code = req.query.code || null;

    if (!code) {
        return res.status(400).send("❌ No se proporcionó código de autenticación.");
    }

    try {
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                code: code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
                }
            }
        );

        const refreshToken = tokenResponse.data.refresh_token;
        console.log("✅ Refresh Token obtenido:", refreshToken);

        return res.json({ message: "✅ Autenticación completada", refresh_token: refreshToken });

    } catch (error) {
        console.error("❌ Error en autenticación:", error.response?.data || error.message);
        return res.status(500).send("Error en autenticación.");
    }
};
