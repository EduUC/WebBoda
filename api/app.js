const express = require('express');
const dotenv = require('dotenv');
const loginRoutes = require('./login');
const callbackRoutes = require('./callback');
const agregarCancionRoutes = require('./agregar-cancion');
const supabase = require('./supabase'); // Si usas Supabase
dotenv.config();

const app = express();

// Middleware para procesar cuerpos JSON
app.use(express.json());

// Rutas
app.use('/api/login', loginRoutes);
app.use('/api/callback', callbackRoutes);
app.use('/api/agregar-cancion', agregarCancionRoutes);

// Puerto y servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
