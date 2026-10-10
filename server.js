require('dotenv').config();
const express = require('express');
const conectarDB = require('./config/db');
const solicitudRoutes = require('./routes/solicitudRoutes');
const logger = require('./middlewares/logger');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Registrar las rutas de solicitudes
app.use('/solicitudes', solicitudRoutes);

// Rutas no encontradas y manejo global de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);

// Iniciar el servidor solo después de conectar con MongoDB
const iniciarServidor = async () => {
    await conectarDB();
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
};

iniciarServidor();
