const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

describe('Pruebas de Seguridad - Validación de ObjectId (REQ-SEG-LMC-01)', () => {
  let testAgent;

  beforeAll(async () => {
    await User.deleteOne({ email: 'objectid_test@test.com' });

    await request(app).post('/api/auth/register').send({
      email: 'objectid_test@test.com',
      password: 'Segura123!'
    });

    testAgent = request.agent(app);
    await testAgent.post('/api/auth/login').send({
      email: 'objectid_test@test.com',
      password: 'Segura123!'
    });
  });

  afterAll(async () => {
    await User.deleteOne({ email: 'objectid_test@test.com' });
    await mongoose.connection.close();
  });

  it('REQ-SEG-LMC-01: GET con ID malformado debe retornar 400', async () => {
    const res = await testAgent.get('/api/calculator/history/id_invalido_$$');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('REQ-SEG-LMC-01: DELETE con ID malformado debe retornar 400', async () => {
    const res = await testAgent.delete('/api/calculator/history/id_invalido_$$');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('REQ-SEG-LMC-01: GET con ObjectId válido pero inexistente debe retornar 404', async () => {
    const idInexistente = new mongoose.Types.ObjectId().toString();
    const res = await testAgent.get(`/api/calculator/history/${idInexistente}`);
    expect(res.statusCode).toBe(404);
  });

  it('REQ-SEG-LMC-01: DELETE con ObjectId válido pero inexistente debe retornar 404', async () => {
    const idInexistente = new mongoose.Types.ObjectId().toString();
    const res = await testAgent.delete(`/api/calculator/history/${idInexistente}`);
    expect(res.statusCode).toBe(404);
  });
});
