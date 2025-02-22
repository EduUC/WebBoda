const { get } = require('http');
const supabase = require('./supabaseClient');
require('dotenv').config();

async function agregarAsistencia(nombre, confirmacion) {
    console.log("🔄 Agregando asistencia:", nombre, confirmacion);

    try {
        const { data, error } = await supabase
            .from('asistencia')
            .insert([{ nombre, confirmacion }]);

        if (error) {
            throw new Error(error.message);  // Lanza un error si Supabase devuelve un error
        }

        console.log("✅ Asistencia agregada a la base de datos:", nombre, confirmacion);
    } catch (err) {
        console.error("❌ Error al insertar asistencia:", err);
        return res.status(500).send("Error al actualizar en la base de datos.");
    }
}

async function gettable() {
    const { data: asistencia, error } = await supabase
        .from('asistencia')
        .select('*');

    if (error || !asistencia.length) {
        console.error("❌ Error al obtener los datos:", error);
        return null;
    }

    return asistencia; // Devuelve toda la data de la tabla
}



module.exports = { agregarAsistencia, gettable };