require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
app.use(cors());
app.use(express.json());

const songRoutes = require('./routes/songRoutes');
const spotifyRoutes = require('./routes/spotifyRoutes');

// 📌 Configurar credenciales de Spotify
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;

app.use('/api/songs', songRoutes);
app.use('/api/spotify', spotifyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

