require('dotenv').config();                       
const express = require('express');
const conectarDB = require('./config/db');      
const solicitudRoutes = require('./routes/solicitudRoutes');

const app = express();
const logger = require('./middlewares/logger');
const PORT = process.env.PORT || 3001;            

conectarDB();                                     

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

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});