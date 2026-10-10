const express = require('express');
const router = express.Router();

const { registrar, login, perfil } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/register', registrar);
router.post('/login', login);

// Ruta protegida: devuelve los datos del usuario dueño del token
router.get('/perfil', verificarToken, perfil);

module.exports = router;
