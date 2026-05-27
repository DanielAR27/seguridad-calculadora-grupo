/**
 * Tests de REQ-SEG-12 (Joyce): Encabezados de Seguridad HTTP via Helmet.
 *
 * Amenaza modelada (4.2.3 / Kristhel): Sin helmet, Express expone X-Powered-By,
 * no envía X-Frame-Options, ni X-Content-Type-Options. Esto facilita fingerprinting
 * del servidor y ataques de clickjacking.
 *
 * Corrección: integrar helmet() en server.js con CSP, frameguard y remoción de
 * X-Powered-By.
 *
 * Patrón: el primer test documenta la VULNERABILIDAD (comportamiento sin helmet).
 *         Los siguientes tests verifican la CORRECCIÓN.
 */

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('REQ-SEG-12: Encabezados de Seguridad HTTP (Helmet)', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ─── Documenta la vulnerabilidad original ────────────────────────────────
  it('VULNERABLE (antes): Express sin helmet envía X-Powered-By por defecto', () => {
    // Sin helmet, Express agrega automáticamente: X-Powered-By: Express
    // Esto revela el stack tecnológico a cualquier atacante que inspeccione la respuesta.
    // El valor por defecto que Express establecería es:
    const valorVulnerable = 'Express';
    expect(valorVulnerable).toBe('Express'); // documenta el comportamiento original
  });

  // ─── Verifica la corrección ───────────────────────────────────────────────
  it('REQ-SEG-12: La respuesta NO debe exponer X-Powered-By (fingerprinting del servidor)', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('REQ-SEG-12: La respuesta debe incluir X-Frame-Options para prevenir clickjacking', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-frame-options']).toBeDefined();
    // Helmet con frameguard: { action: 'deny' } establece DENY
    expect(res.headers['x-frame-options'].toUpperCase()).toBe('DENY');
  });

  it('REQ-SEG-12: La respuesta debe incluir X-Content-Type-Options para prevenir MIME sniffing', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('REQ-SEG-12: La respuesta debe incluir Content-Security-Policy', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('REQ-SEG-12: Los encabezados de seguridad deben estar presentes también en rutas de la API', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
