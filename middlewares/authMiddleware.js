const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');

// Verifica que la petición traiga un JWT válido en el header:
// Authorization: Bearer <token>
const verificarToken = async (req, res, next) => {
    try {
        const header = req.headers.authorization || '';
        const [tipo, token] = header.split(' ');

        if (tipo !== 'Bearer' || !token) {
            return res.status(401).json({ mensaje: 'Acceso denegado: token no proporcionado' });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Confirmar que el usuario del token todavía existe (y tomar su rol actual)
        const usuario = await Usuario.findById(payload.id);
        if (!usuario) {
            return res.status(401).json({ mensaje: 'El usuario del token ya no existe' });
        }

        // Queda disponible para los siguientes middlewares y controladores
        req.usuario = { id: usuario._id.toString(), nombre: usuario.nombre, rol: usuario.rol };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ mensaje: 'El token ha expirado, inicia sesión nuevamente' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ mensaje: 'Token inválido' });
        }
        next(error);
    }
};

// Autorización por roles: se usa DESPUÉS de verificarToken
// Ejemplo: router.delete('/:id', verificarToken, permitirRoles('admin'), eliminar)
const permitirRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                mensaje: `Acceso prohibido: se requiere rol ${rolesPermitidos.join(' o ')}`
            });
        }
        next();
    };
};

module.exports = { verificarToken, permitirRoles };
