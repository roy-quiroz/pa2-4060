// Middleware para rutas que no existen (404)
function notFound(req, res, next) {
    res.status(404).json({
        mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
}

// Middleware global de errores: recibe lo que los controladores envían con next(error)
function errorHandler(err, req, res, next) {
    // ID con formato inválido de MongoDB (ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({ mensaje: 'ID no válido', error: err.message });
    }

    // Datos que no cumplen las reglas del modelo Mongoose
    if (err.name === 'ValidationError') {
        const errores = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    }

    // JSON mal formado en el body
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ mensaje: 'El cuerpo de la solicitud no es un JSON válido' });
    }

    // Cualquier otro error es del servidor
    console.error(err);
    res.status(err.status || 500).json({
        mensaje: err.message || 'Error interno del servidor'
    });
}

module.exports = { notFound, errorHandler };
