// api/spotify/add.js
const { addAsistencia } = require('../controllers/asistenciaController');

module.exports = (req, res) => {
  console.log("✅ data", req.body);

  addAsistencia(req, res);
};
