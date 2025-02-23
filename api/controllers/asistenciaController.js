const { agregarAsistencia_Ceremonia, agregarAsistencia_Celebracion } = require('../services/asistenciaClient');

const addAsistencia = async (req, res) => {
    console.log("🔄 POST addAsistencia");
    console.log("Body", req.body);

    const { num_asistentes, asistencia, tipo_asistencia, dato_adicional } = req.body;
    const datoAdicional = dato_adicional || " ";

    if (!['ceremonia', 'celebracion'].includes(tipo_asistencia)) {
        return res.json({
            message: "Tipo de asistencia no válido",
            success: false,
        });
    }

    try {
        for (let i = 1; i <= num_asistentes; i++) {
            const nombre = req.body[`persona-${i}-nombre`];
            if (nombre) {
                // Dependiendo del tipo de asistencia, agrega la correcta
                
                if (tipo_asistencia === 'ceremonia') {
                    await (agregarAsistencia_Ceremonia(nombre, asistencia));
                } else if (tipo_asistencia === 'celebracion') {
                    await (agregarAsistencia_Celebracion(nombre, asistencia, datoAdicional));
                }
            }
        }

        console.log(`✅Asistencia ${tipo_asistencia} confirmada`);

        res.json({ 
            message: "Asistencia confirmada",
            success: true,
        });
    } catch (error) {
        console.error("❌ Error al insertar asistencia:", error);
        res.json({
            message: "Error al confirmar asistencia",
            success: false,
        });
    }
};

module.exports = { addAsistencia };
