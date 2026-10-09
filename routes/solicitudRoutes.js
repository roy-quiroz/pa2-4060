const express = require('express');

const router = express.Router();

// Almacenamiento temporal para las pruebas.
// Más adelante se reemplazará por MongoDB.
let solicitudes = [];
let siguienteId = 1;

// GET: listar todas las solicitudes
router.get('/', (req, res) => {
    res.status(200).json({
        total: solicitudes.length,
        solicitudes
    });
});

// GET: consultar una solicitud por ID
router.get('/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            mensaje: 'El ID debe ser un número entero positivo'
        });
    }

    const solicitud = solicitudes.find(item => item.id === id);

    if (!solicitud) {
        return res.status(404).json({
            mensaje: 'Solicitud no encontrada'
        });
    }

    res.status(200).json(solicitud);
});

// POST: crear una solicitud
router.post('/', (req, res) => {
    const { alumno, curso, descripcion } = req.body;

    if (
        typeof alumno !== 'string' || !alumno.trim() ||
        typeof curso !== 'string' || !curso.trim() ||
        typeof descripcion !== 'string' || !descripcion.trim()
    ) {
        return res.status(400).json({
            mensaje: 'Alumno, curso y descripción son obligatorios'
        });
    }

    const nuevaSolicitud = {
        id: siguienteId++,
        alumno: alumno.trim(),
        curso: curso.trim(),
        descripcion: descripcion.trim(),
        estado: 'Pendiente',
        fechaCreacion: new Date().toISOString()
    };

    solicitudes.push(nuevaSolicitud);

    res.status(201).json({
        mensaje: 'Solicitud creada correctamente',
        solicitud: nuevaSolicitud
    });
});

// PUT: actualizar una solicitud
router.put('/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            mensaje: 'El ID debe ser un número entero positivo'
        });
    }

    const indice = solicitudes.findIndex(item => item.id === id);

    if (indice === -1) {
        return res.status(404).json({
            mensaje: 'Solicitud no encontrada'
        });
    }

    const { alumno, curso, descripcion, estado } = req.body;

    const estadosValidos = [
        'Pendiente',
        'En revisión',
        'Aprobada',
        'Rechazada'
    ];

    if (
        typeof alumno !== 'string' || !alumno.trim() ||
        typeof curso !== 'string' || !curso.trim() ||
        typeof descripcion !== 'string' || !descripcion.trim() ||
        !estadosValidos.includes(estado)
    ) {
        return res.status(400).json({
            mensaje: 'Envía alumno, curso, descripción y un estado válido'
        });
    }

    solicitudes[indice] = {
        ...solicitudes[indice],
        alumno: alumno.trim(),
        curso: curso.trim(),
        descripcion: descripcion.trim(),
        estado
    };

    res.status(200).json({
        mensaje: 'Solicitud actualizada correctamente',
        solicitud: solicitudes[indice]
    });
});

// DELETE: eliminar una solicitud
router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            mensaje: 'El ID debe ser un número entero positivo'
        });
    }

    const indice = solicitudes.findIndex(item => item.id === id);

    if (indice === -1) {
        return res.status(404).json({
            mensaje: 'Solicitud no encontrada'
        });
    }

    const eliminada = solicitudes.splice(indice, 1)[0];

    res.status(200).json({
        mensaje: 'Solicitud eliminada correctamente',
        solicitud: eliminada
    });
});

module.exports = router;
