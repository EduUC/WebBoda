const supabase = require('./supabaseClient');
require('dotenv').config();

async function agregarAsistencia(nombre, confirmacion) {
    const { data, error } = await supabase
        .from('asistencia')
        .insert([{ nombre, confirmacion }]);

    if (error) {
        console.error("❌ Error al insertar asistencia:", error);
        return res.status(500).send("Error al actualizar en la base de datos.");
    } else {
        console.log("✅ Asistencia agregada a la base de datos:", nombre, confirmacion);
    }

    return data;
}

module.exports = { agregarAsistencia };