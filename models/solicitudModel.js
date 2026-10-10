const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
    // Usuario dueño de la solicitud (relación con la colección "usuarios")
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'La solicitud debe pertenecer a un usuario']
    },
    // Se completa automáticamente con el nombre del usuario autenticado
    alumno: {
        type: String,
        required: [true, 'El nombre del alumno es obligatorio'],
        trim: true
    },
    curso: {
        type: String,
        required: [true, 'El curso es obligatorio'],
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'En revisión', 'Aprobada', 'Rechazada'],
        default: 'Pendiente'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

// Tercer parámetro: nombre exacto de la colección (evita que Mongoose la llame "solicituds")
module.exports = mongoose.model('Solicitud', solicitudSchema, 'solicitudes');