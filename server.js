const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'client')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Rutas API
app.use('/api/properties', require('./server/routes/properties'));
app.use('/api/furniture', require('./server/routes/furniture'));
app.use('/api/configurations', require('./server/routes/configurations'));
app.use('/api/tours', require('./server/routes/tours'));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Ruta para el configurador de una propiedad específica
app.get('/configurador/:propertyId', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal!', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🏠 Servidor del Configurador 3D iniciado`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Iniciado: ${new Date().toLocaleString()}\n`);
});

module.exports = app;