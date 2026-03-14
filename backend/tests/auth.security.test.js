const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

describe('Pruebas de Seguridad - Explotación de la Confianza en Auth', () => {
  
  // Limpiar el usuario de prueba antes de empezar
  beforeAll(async () => {
    await User.deleteOne({ email: 'hacker@test.com' });
  });

  // Limpiar la base de datos y cerrar conexión al terminar
  afterAll(async () => {
    await User.deleteOne({ email: 'hacker@test.com' });
    await mongoose.connection.close();
  });

  it('REQ-SEG-01: Debe ignorar la inyección del rol admin en el registro', async () => {
    // 1. El atacante envía el payload malicioso
    const payloadMalicioso = {
      email: 'hacker@test.com',
      password: 'Segura123!',
      role: 'admin' // Intento de escalación de privilegios
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(payloadMalicioso);

    expect(res.statusCode).toBe(201);

    // Se verifica en la base de datos qué rol se le asignó realmente
    const usuarioCreado = await User.findOne({ email: 'hacker@test.com' });
    
    // LA PRUEBA: Se exige  que el sistema se haya defendido y asignado 'user'
    expect(usuarioCreado.role).toBe('user'); 
  });
});