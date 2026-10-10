const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');

// Genera un JWT con el id y el rol del usuario
const generarToken = (usuario) => {
    return jwt.sign(
        { id: usuario._id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
};

// Datos públicos del usuario (sin contraseña)
const datosPublicos = (usuario) => ({
    id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol
});

//POST /auth/register
exports.registrar = async (req, res, next) => {
    try {
        const { nombre, email, password } = req.body;

        // El rol NO se toma del body: todo registro público es "estudiante".
        // Los administradores se crean con el script "npm run crear-admin".
        const usuario = await Usuario.create({ nombre, email, password });

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: datosPublicos(usuario),
            token: generarToken(usuario)
        });
    } catch (error) {
        next(error);
    }
};

//POST /auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
        }

        // select('+password') porque en el modelo está oculto por defecto
        const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+password');

        // Mismo mensaje en ambos casos para no revelar si el email existe
        if (!usuario || !(await usuario.compararPassword(password))) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: datosPublicos(usuario),
            token: generarToken(usuario)
        });
    } catch (error) {
        next(error);
    }
};
