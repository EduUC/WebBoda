const axios = require('axios');
const querystring = require('querystring');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://webboda.vercel.app/api/callback'; // Cambia esta URI a tu URI real
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const refreshAccessToken = async () => {
    if (REFRESH_TOKEN) {
        console.log("Refrescando el token de acceso...");

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

            return response.data.access_token; // Si el refresh token es válido, devuelve el nuevo access token
        } catch (error) {
            console.error("❌ Error al refrescar el token:", error.response?.data || error.message);
            return null;
        }
    } else {
        console.log("No se encontró el refresh_token. Iniciando proceso de autorización.");
        return await requestNewRefreshToken();
    }
};

const requestNewRefreshToken = async () => {
    // Esto es lo que se debe hacer si no tienes un refresh_token válido
    const code = await getAuthCodeFromUser(); // Aquí debes obtener el código de autorización del usuario
    return await getTokensFromCode(code);
};

const getAuthCodeFromUser = () => {
    // Redirigir al usuario a la página de autorización de Spotify
    const scope = 'playlist-modify-public playlist-modify-private';
    const authUrl = `https://accounts.spotify.com/authorize?` + querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI
    });

    console.log(`Por favor, visita este enlace para autorizar la aplicación: ${authUrl}`);
    // Aquí podrías redirigir al usuario a este enlace o mostrarle un mensaje de alguna forma
    return new Promise(resolve => {
        // Simula un flujo en el que el usuario pega el código de autorización que recibió
        // (normalmente el servidor recibiría este código en un callback)
        const rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question("Introduce el código de autorización: ", function(code) {
            rl.close();
            resolve(code);
        });
    });
};

const getTokensFromCode = async (code) => {
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

        const { access_token, refresh_token } = response.data;

        // Aquí guardamos el refresh_token que es necesario para futuras solicitudes
        console.log("Access Token:", access_token);
        console.log("Refresh Token:", refresh_token);

        // Aquí debes guardar el refresh_token en tu entorno, archivo o base de datos.
        process.env.SPOTIFY_REFRESH_TOKEN = refresh_token;

        return access_token; // Regresa el nuevo access_token
    } catch (error) {
        console.error("❌ Error al obtener los tokens:", error.response?.data || error.message);
        return null;
    }
};

module.exports = refreshAccessToken;
