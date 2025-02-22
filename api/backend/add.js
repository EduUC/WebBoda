// api/spotify/add.js
const { addAsistencia } = require('../controllers/asistenciaController');

module.exports = (req, res) => {
  addAsistencia(req, res);
};
