const express = require('express');
const { addAsistencia } = require('../controllers/asistenciaController');
const router = express.Router();
const multer = require('multer');
const upload = multer();

router.post('/add', upload.none(), addAsistencia);
module.exports = router;
