const mongoose = require('mongoose');

// Lectura de parámetros de conexión desde las variables de entorno.
// Estas deben ser cargadas previamente por server.js o por el gestor correspondiente.
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;

// Construcción de la URI de conexión.

// En entornos locales se utiliza mongodb://localhost:27017/<DB_NAME>.
// En Docker, DB_HOST suele ser el nombre del servicio declarado en docker-compose.
const MONGO_URI = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Establecer conexión con la base de datos MongoDB.
const connectDB = async () => {
  try {
    // Intento de conexión con la instancia de Mongo.
    await mongoose.connect(MONGO_URI);
    console.log('Conexión exitosa a MongoDB');
  } catch (error) {
    // Registro del error y cierre del proceso en caso de falla crítica.
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1); // Detiene la aplicación si no se puede establecer conexión.
  }
};

module.exports = connectDB;