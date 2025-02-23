const { agregarAsistencia, gettable} = require('../services/asistenciaClient');

const addAsistencia = async (req, res) => {
    console.log("🔄 POST addAsistencia");
    console.log("Body", req.body);

    const { num_asistentes } = req.body;
    const { asistencia } = req.body;

    try {
        for (let i = 1; i <= num_asistentes; i++) {
            const nombre = req.body[`persona-${i}-nombre`];
            if (nombre) {
                agregarAsistencia(nombre, asistencia);
            }
        }

        console.log(" ✅Asistencia confirmada");

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

module.exports = { addAsistencia };