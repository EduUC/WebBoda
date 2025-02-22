// api/spotify/add.js
const { addAsistencia } = require('../controllers/asistenciaController');
const multer = require('multer');
const upload = multer();

module.exports = (req, res) => {
  upload.none()(req, res, () => {
    addAsistencia(req, res);  
  };
};