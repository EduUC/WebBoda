require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const spotifyRoutes = require('./routes/spotifyRoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');

app.use('/api/spotify', spotifyRoutes);
app.use('/api/backend', asistenciaRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

