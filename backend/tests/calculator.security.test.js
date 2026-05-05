const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Calculation = require('../src/models/Calculation.model');
const User = require('../src/models/User.model');

describe('Pruebas de Seguridad - Contaminación en Historial Financiero', () => {
  let testAgent;
  let userId;

  // Setup: crear usuario, autenticar con cookie mediante agent
  beforeAll(async () => {
    await User.deleteOne({ email: 'calc_test@test.com' });

    const resAuth = await request(app).post('/api/auth/register').send({
      email: 'calc_test@test.com',
      password: 'Segura123!'
    });
    userId = resAuth.body.userId;

    testAgent = request.agent(app);
    await testAgent.post('/api/auth/login').send({
      email: 'calc_test@test.com',
      password: 'Segura123!'
    });
  });

  afterAll(async () => {
    await User.deleteOne({ email: 'calc_test@test.com' });
    await Calculation.deleteMany({ user: userId });
    await mongoose.connection.close();
  });

  it('REQ-SEG-03: Debe descartar campos no permitidos al guardar un cálculo', async () => {
    const payloadContaminado = {
      principal: 1000,
      rate: 5,
      time: 2,
      type: 'Simple Interest',
      scriptMalicioso: "<script>alert('XSS')</script>",
      campoFalso: "bypass_validation"
    };

    const res = await testAgent
      .post('/api/calculator/simple-interest?save=true')
      .send(payloadContaminado);

    expect(res.statusCode).toBe(201);

    const calculoGuardado = await Calculation.findById(res.body._id);

    expect(calculoGuardado.inputs.scriptMalicioso).toBeUndefined();
    expect(calculoGuardado.inputs.campoFalso).toBeUndefined();
  });
});
