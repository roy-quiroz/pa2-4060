const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato válido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false // nunca se devuelve en las consultas, salvo que se pida explícitamente
    },
    rol: {
        type: String,
        enum: ['estudiante', 'admin'],
        default: 'estudiante'
    }
}, {
    timestamps: true // agrega createdAt y updatedAt
});

// Antes de guardar, cifrar la contraseña con bcrypt (solo si es nueva o cambió)
usuarioSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar la contraseña ingresada con la cifrada
usuarioSchema.methods.compararPassword = function (passwordIngresada) {
    return bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema, 'usuarios');
