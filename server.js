require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const conectarDB = require('./config/db');
const solicitudRoutes = require('./routes/solicitudRoutes');
const authRoutes = require('./routes/authRoutes');
const logger = require('./middlewares/logger');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Seguridad: cabeceras HTTP seguras
app.use(helmet());

// CORS: solo los orígenes (frontends) permitidos en el .env pueden consumir la API desde el navegador
const origenesPermitidos = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origen => origen.trim());

app.use(cors({
    origin: origenesPermitidos,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para interpretar solicitudes JSON
app.use(express.json());
app.use(logger);

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        mensaje: 'API de Gestión de Solicitudes Académicas',
        estado: 'Servidor funcionando correctamente'
    });
});

// Registrar las rutas de autenticación y de solicitudes
app.use('/auth', authRoutes);
app.use('/solicitudes', solicitudRoutes);

// Rutas no encontradas y manejo global de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);

// Iniciar el servidor solo después de conectar con MongoDB
const iniciarServidor = async () => {
    // Sin clave secreta no se pueden firmar tokens JWT
    if (!process.env.JWT_SECRET) {
        console.error('Falta JWT_SECRET en el archivo .env');
        process.exit(1);
    }

    await conectarDB();
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
};

iniciarServidor();
