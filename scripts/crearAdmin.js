// Crea (o actualiza a rol admin) un usuario administrador usando los datos del .env
// Uso: npm run crear-admin
require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/usuarioModel');

const crearAdmin = async () => {
    const { ADMIN_NOMBRE, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error('Faltan ADMIN_EMAIL y/o ADMIN_PASSWORD en el archivo .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const existente = await Usuario.findOne({ email: ADMIN_EMAIL.toLowerCase() });

        if (existente) {
            existente.rol = 'admin';
            await existente.save();
            console.log(`El usuario ${ADMIN_EMAIL} ya existía; ahora tiene rol admin`);
        } else {
            await Usuario.create({
                nombre: ADMIN_NOMBRE || 'Administrador',
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                rol: 'admin'
            });
            console.log(`Administrador ${ADMIN_EMAIL} creado correctamente`);
        }
    } catch (error) {
        console.error('Error al crear el administrador:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

crearAdmin();
