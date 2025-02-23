const supabase = require('./supabaseClient');
require('dotenv').config();

async function agregarAsistencia_Ceremonia(nombre, confirmacion) {
    try {
        const { data, error } = await supabase
            .from('asistencia')
            .insert([{ nombre, confirmacion }]);

        if (error) {
            throw new Error(error.message);  
        }

        console.log("✅ Asistencia agregada a la base de datos:", nombre, confirmacion);
    } catch (err) {
        console.error("❌ Error al insertar asistencia:", err);
        return res.status(500).send("Error al actualizar en la base de datos.");
    }
}

async function agregarAsistencia_Celebracion(nombre, confirmacion, datoAdicional) {
    try {
        const { data, error } = await supabase
            .from('asistencia')
            .insert([{ nombre, confirmacion, datoAdicional}]);

        if (error) {
            throw new Error(error.message); 
        }

        console.log("✅ Asistencia agregada a la base de datos:", nombre, confirmacion, datoAdicional);
    } catch (err) {
        console.error("❌ Error al insertar asistencia:", err);
        return res.status(500).send("Error al actualizar en la base de datos.");
    }
}


module.exports = { agregarAsistencia_Ceremonia, agregarAsistencia_Celebracion };