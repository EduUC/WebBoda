const { agregarAsistencia, gettable} = require('../services/asistenciaClient');

const addAsistencia = async (req, res) => {
    console.log("✅ POST addAsistencia");
    console.log("Body", req.body);

    let personas = [];
    const { num_asistentes } = req.body;
    const { asistencia } = req.body;


    cosas = await gettable();
    console.log("Data", cosas);

    try {
        for (let i = 1; i <= num_asistentes; i++) {
            const nombre = req.body[`persona-${i}-nombre`];
            if (nombre) {
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