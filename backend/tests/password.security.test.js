const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

describe('Pruebas de Seguridad - Regex de Contraseña en User.model (REQ-SEG-LMC-02)', () => {

  afterAll(async () => {
    await User.deleteMany({
      email: { $in: ['weak1@test.com', 'weak2@test.com', 'weak3@test.com', 'strong@test.com'] }
    });
    await mongoose.connection.close();
  });

  it('REQ-SEG-LMC-02: Debe rechazar contraseña sin mayúscula', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'weak1@test.com',
      password: 'sinmayuscula1!'
    });
    expect(res.statusCode).toBe(400);
  });

  it('REQ-SEG-LMC-02: Debe rechazar contraseña sin número', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'weak2@test.com',
      password: 'SinNumero!'
    });
    expect(res.statusCode).toBe(400);
  });

  it('REQ-SEG-LMC-02: Debe rechazar contraseña con menos de 8 caracteres', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'weak3@test.com',
      password: 'Aa1!'
    });
    expect(res.statusCode).toBe(400);
  });

  it('REQ-SEG-LMC-02: Debe aceptar contraseña que cumpla todos los criterios', async () => {
    await User.deleteOne({ email: 'strong@test.com' });
    const res = await request(app).post('/api/auth/register').send({
      email: 'strong@test.com',
      password: 'Segura123!'
    });
    expect(res.statusCode).toBe(201);
  });
});
