const { agregarAsistencia_Ceremonia, agregarAsistencia_Celebracion } = require('../services/asistenciaClient');

const addAsistencia = async (req, res) => {
    console.log("🔄 POST addAsistencia");
    console.log("Body", req.body);

    const { num_asistentes, asistencia } = req.body;

    try {
        for (let i = 1; i <= num_asistentes; i++) {
            const nombre = req.body[`persona-${i}-nombre`];
            if (nombre) {
                await agregarAsistencia_Ceremonia(nombre, asistencia);
            }
        }

        console.log(" ✅Asistencia Ceremonia confirmada");

        res.json({ 
            message: "Asistencia confirmada",
            success: true,
        });
    }
    catch (error) {
        console.error("❌ Error al insertar asistencia:", error);
        res.json({
            message: "Error al confirmar asistencia",
            success: false,
        });
    }
};

const addAsistencia_Celebracion = async (req, res) => {
    console.log("🔄 POST addAsistencia_Celebracion");
    console.log("Body", req.body);

    const { num_asistentes, asistencia, dato_adicional } = req.body;
    const datoAdicional = dato_adicional || " ";


    try {
        for (let i = 1; i <= num_asistentes; i++) {
            const nombre = req.body[`persona-${i}-nombre`];
            if (nombre) {
                await agregarAsistencia_Celebracion(nombre, asistencia, datoAdicional);
            }
        }

        console.log(" ✅Asistencia Celebracion confirmada");

        res.json({ 
            message: "Asistencia confirmada",
            success: true,
        });
    }
    catch (error) {
        console.error("❌ Error al insertar asistencia:", error);
        res.json({
            message: "Error al confirmar asistencia",
            success: false,
        });
    }
}

module.exports = { addAsistencia, addAsistencia_Celebracion };