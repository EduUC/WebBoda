const supabase = require('./supabaseClient');
require('dotenv').config();

async function agregarAsistencia_Ceremonia(nombre, confirmacion) {
    try {
        const { data, error } = await supabase
            .from('asistencia_ceremonia')
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

async function agregarAsistencia_Celebracion(nombre, confirmacion, datoadicional) {
    try {
        const { data, error } = await supabase
            .from('asistencia_celebracion')
            .insert([{ nombre, confirmacion, datoadicional}]);

        if (error) {
            throw new Error(error.message); 
        }

        console.log("✅ Asistencia agregada a la base de datos:", nombre, confirmacion, datoadicional);
    } catch (err) {
        console.error("❌ Error al insertar asistencia:", err);
        return res.status(500).send("Error al actualizar en la base de datos.");
    }
}


module.exports = { agregarAsistencia_Ceremonia, agregarAsistencia_Celebracion };