// Cargar variables de entorno
require('dotenv').config();

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

// 7. Iniciar el servidor
const PORT = process.env.NODE_PORT;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});