const express = require('express');
const router = express.Router();

const {
    obtenerSolicitudes,
    obtenerSolicitudPorId,
    crearSolicitud,
    actualizarSolicitud,
    actualizarSolicitudParcial,
    eliminarSolicitud } = require('../controllers/solicitudController');

const { verificarToken, permitirRoles } = require('../middlewares/authMiddleware');

// Todas las rutas de solicitudes requieren un usuario autenticado
router.use(verificarToken);

// estudiante: solo sus solicitudes | admin: todas
router.get('/', obtenerSolicitudes);
router.get('/:id', obtenerSolicitudPorId);
router.post('/', crearSolicitud);
router.put('/:id', actualizarSolicitud);
router.patch('/:id', actualizarSolicitudParcial);

// Solo el administrador puede eliminar
router.delete('/:id', permitirRoles('admin'), eliminarSolicitud);

module.exports = router;
