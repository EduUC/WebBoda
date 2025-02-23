// api/spotify/add.js
const { addAsistencia_Celebracion } = require('../controllers/asistenciaController');
const multer = require('multer');
const upload = multer();

module.exports = (req, res) => {
  upload.none()(req, res, () => {
    addAsistencia_Celebracion(req, res);
  });
};
