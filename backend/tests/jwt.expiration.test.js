/**
 * Tests de REQ-SEG-11 (Joyce): Gestión de Sesiones — Expiración del Token JWT.
 *
 * Amenaza modelada (4.4.1): Un token válido por 24h da al atacante un día
 * completo para operar si lo intercepta.
 *
 * Corrección: reducir expiresIn a '15m' y sincronizar el maxAge de la cookie.
 *
 * Patrón: el primer test documenta la VULNERABILIDAD original (token de 24h).
 *         Los siguientes tests verifican la CORRECCIÓN.
 */

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const TEST_USER = { email: 'jwt_expiry_test@test.com', password: 'Segura123!' };

describe('REQ-SEG-11: Expiración del Token JWT', () => {
  beforeAll(async () => {
    await User.deleteOne({ email: TEST_USER.email });
    await request(app).post('/api/auth/register').send(TEST_USER);
  });

  afterAll(async () => {
    await User.deleteOne({ email: TEST_USER.email });
    await mongoose.connection.close();
  });

  // ─── Documenta la vulnerabilidad original ────────────────────────────────
  it('VULNERABLE (antes): un token firmado con 1d tiene 86400 segundos de vida', () => {
    const tokenVulnerable = jwt.sign(
      { userId: 'test', email: TEST_USER.email, role: 'user' },
      process.env.JWT_SECRET || 'secret_inseguro',
      { expiresIn: '1d' }
    );
    const decoded = jwt.decode(tokenVulnerable);
    const lifetimeSeconds = decoded.exp - decoded.iat;

    // Documenta que 1d = 86400s es la ventana de explotación original.
    expect(lifetimeSeconds).toBe(86400);
  });

  // ─── Verifica la corrección ───────────────────────────────────────────────
  it('REQ-SEG-11: El token emitido al hacer login debe tener vigencia de exactamente 15 minutos', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(TEST_USER);

    expect(res.statusCode).toBe(200);

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();

    const tokenCookie = cookies.find(c => c.startsWith('token='));
    expect(tokenCookie).toBeDefined();

    const tokenValue = tokenCookie.split(';')[0].replace('token=', '');
    const decoded = jwt.decode(tokenValue);

    const lifetimeSeconds = decoded.exp - decoded.iat;

    // El token debe durar exactamente 15 minutos (900 segundos)
    expect(lifetimeSeconds).toBe(900);
  });

  it('REQ-SEG-11: La vigencia del token debe ser menor o igual a 60 minutos (máximo permitido)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(TEST_USER);

    const cookies = res.headers['set-cookie'];
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    const tokenValue = tokenCookie.split(';')[0].replace('token=', '');
    const decoded = jwt.decode(tokenValue);

    const lifetimeSeconds = decoded.exp - decoded.iat;

    expect(lifetimeSeconds).toBeLessThanOrEqual(60 * 60);
  });

  it('REQ-SEG-11: La cookie debe tener Max-Age consistente con la expiración del token (900s)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(TEST_USER);

    const cookies = res.headers['set-cookie'];
    const tokenCookie = cookies.find(c => c.startsWith('token='));

    // maxAge: 15 * 60 * 1000 ms en Express se traduce a Max-Age=900 en la cabecera
    expect(tokenCookie).toMatch(/Max-Age=900/i);
  });
});
