// Cargar variables de entorno
require('dotenv').config();

// MITIGACIÓN REQ-SEG-02: Validación de clave criptográfica fuerte
if (!process.env.JWT_SECRET) {
  console.error("ERROR FATAL: La variable de entorno JWT_SECRET no está definida.");
  process.exit(1); // Apaga el servidor inmediatamente por seguridad
}

// Importar dependencias
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const mainRouter = require('./src/routes'); // (Apunta a src/routes/index.js)

// Inicializar la conexión a la DB
connectDB();

// Crear la aplicación de Express
const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas

// Ruta de prueba inicial
app.get('/', (req, res) => {
  res.json({ message: 'API de Calculadora Financiera corriendo' });
});

app.use('/api', mainRouter);

// 7. Iniciar el servidor (SOLO si no estamos corriendo pruebas con Jest)
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.NODE_PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

// Se exporta la app para la ejecución de pruebas
module.exports = app;