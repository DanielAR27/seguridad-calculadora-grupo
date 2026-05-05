const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

describe('Pruebas de Seguridad - Autenticación con Cookies HttpOnly (REQ-SEG-LMC-03)', () => {
  let testAgent;

  beforeAll(async () => {
    await User.deleteOne({ email: 'cookie_test@test.com' });
    await request(app).post('/api/auth/register').send({
      email: 'cookie_test@test.com',
      password: 'Segura123!'
    });
    testAgent = request.agent(app);
  });

  afterAll(async () => {
    await User.deleteOne({ email: 'cookie_test@test.com' });
    await mongoose.connection.close();
  });

  it('REQ-SEG-LMC-03: El login debe establecer una cookie con flag HttpOnly', async () => {
    const res = await testAgent.post('/api/auth/login').send({
      email: 'cookie_test@test.com',
      password: 'Segura123!'
    });

    expect(res.statusCode).toBe(200);

    const setCookieHeader = res.headers['set-cookie'];
    expect(setCookieHeader).toBeDefined();

    const tokenCookie = setCookieHeader.find(c => c.startsWith('token='));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie.toLowerCase()).toContain('httponly');
  });

  it('REQ-SEG-LMC-03: El token NO debe estar expuesto en el body de la respuesta', async () => {
    const res = await testAgent.post('/api/auth/login').send({
      email: 'cookie_test@test.com',
      password: 'Segura123!'
    });
    expect(res.body.token).toBeUndefined();
    expect(res.body.user).toBeDefined();
  });

  it('REQ-SEG-LMC-03: Una ruta protegida debe ser accesible con cookie activa', async () => {
    const res = await testAgent.get('/api/auth/me');
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toBeDefined();
  });

  it('REQ-SEG-LMC-03: Una ruta protegida debe rechazar peticiones sin cookie', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('REQ-SEG-LMC-03: El logout debe eliminar la cookie de sesión', async () => {
    const res = await testAgent.post('/api/auth/logout');
    expect(res.statusCode).toBe(200);

    const setCookieHeader = res.headers['set-cookie'];
    if (setCookieHeader) {
      const tokenCookie = setCookieHeader.find(c => c.startsWith('token='));
      if (tokenCookie) {
        // Cookie eliminada: Expires en el pasado o Max-Age=0
        const isExpired =
          tokenCookie.includes('Expires=Thu, 01 Jan 1970') ||
          tokenCookie.includes('Max-Age=0');
        expect(isExpired).toBe(true);
      }
    }
  });
});
