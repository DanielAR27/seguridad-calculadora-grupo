/**
 * Tests de REQ-SEG-10 (Joyce): Complejidad de Contraseñas.
 *
 * El modelo de usuario debe rechazar mediante validación Regex cualquier
 * contraseña que no cumpla: mínimo 8 caracteres, al menos una letra mayúscula,
 * un número y un carácter especial.
 *
 * Implementación: User.model.js — propiedad validate con Regex en el campo password.
 */

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

describe('REQ-SEG-10 (Joyce): Complejidad de Contraseñas', () => {
  afterAll(async () => {
    await User.deleteMany({
      email: {
        $in: [
          'req10_nomayus@test.com',
          'req10_nonum@test.com',
          'req10_noespecial@test.com',
          'req10_corta@test.com',
          'req10_valida@test.com',
        ],
      },
    });
    await mongoose.connection.close();
  });

  it('REQ-SEG-10: Debe rechazar contraseña sin letra mayúscula', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'req10_nomayus@test.com',
      password: 'sinmayuscula1!',
    });
    expect(res.statusCode).toBe(400);
  });

  it('REQ-SEG-10: Debe rechazar contraseña sin número', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'req10_nonum@test.com',
      password: 'SinNumero!',
    });
    expect(res.statusCode).toBe(400);
  });

  it('REQ-SEG-10: Debe rechazar contraseña sin carácter especial', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'req10_noespecial@test.com',
      password: 'SinEspecial1',
    });
    expect(res.statusCode).toBe(400);
  });

  it('REQ-SEG-10: Debe rechazar contraseña con menos de 8 caracteres', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'req10_corta@test.com',
      password: 'Aa1!',
    });
    expect(res.statusCode).toBe(400);
  });

  it('REQ-SEG-10: Debe aceptar contraseña que cumple todos los criterios (≥8 chars, mayúscula, número, especial)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'req10_valida@test.com',
      password: 'Segura123!',
    });
    expect(res.statusCode).toBe(201);
  });
});
