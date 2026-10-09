const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Solicitud', solicitudSchema);