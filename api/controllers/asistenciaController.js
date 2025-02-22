const { agregarAsistencia } = require('../services/asistenciaClient');

const addAsistencia = (req, res) => {
    console.log("✅ POST addAsistencia");

    let personas = [];
    const { num_asistentes } = req.body;
    const { asistencia } = req.body;

    console.log("Body", req.body);


    console.log("Asistentes", num_asistentes);
    console.log("Confirmacion", asistencia);

    for (let i = 1; i <= num_asistentes; i++) {
        const nombre = req.body[`persona-${i}-nombre`];
        if (nombre) {
            personas.push({ id: i, nombre });
        }
    }

    console.log("Personas", personas);

    try {
        for (let i = 1; i <= num_asistentes; i++) {
            const nombre = req.body[`persona-${i}-nombre`];
            if (nombre) {
                personas.push({ id: i, nombre });
                agregarAsistencia(nombre, asistencia);
            }
        }

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