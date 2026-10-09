const express = require('express');
const router = express.Router();

const {
    obtenerSolicitudes, 
    obtenerSolicitudPorId, 
    crearSolicitud, 
    actualizarSolicitud,
    actualizarSolicitudParcial, 
    eliminarSolicitud } = require('../controllers/solicitudController')

router.get('/', obtenerSolicitudes);
router.get('/:id', obtenerSolicitudPorId);
router.post('/', crearSolicitud);
router.put('/:id', actualizarSolicitud);
router.patch('/:id', actualizarSolicitudParcial)
router.delete('/:id', eliminarSolicitud);

module.exports = router