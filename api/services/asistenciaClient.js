const axios = require('axios');
const supabase = require('./supabaseClient');
require('dotenv').config();

async function agregarAsistencia(nombre, confirmacion) {
    console.log("✅ POST agregarAsistencia");

    const { data, error } = await supabase
        .from('asistencia')
        .insert([{ nombre, confirmacion }]);

    if (error) {
        console.error("❌ Error al insertar asistencia:", error);
        return null;
    }

    return data;
}

module.exports = { agregarAsistencia };