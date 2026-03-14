const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Calculation = require('../src/models/Calculation.model');
const User = require('../src/models/User.model');

describe('Pruebas de Seguridad - Contaminación en Historial Financiero', () => {
  let tokenAuth;
  let userId;

  // Setup: Crear un usuario real y obtener su token para la prueba
  beforeAll(async () => {
    const resAuth = await request(app).post('/api/auth/register').send({
      email: 'calc_test@test.com',
      password: 'Segura123!'
    });
    userId = resAuth.body.userId;

    const resLogin = await request(app).post('/api/auth/login').send({
      email: 'calc_test@test.com',
      password: 'Segura123!'
    });
    tokenAuth = resLogin.body.token;
  });

  afterAll(async () => {
    await User.deleteOne({ email: 'calc_test@test.com' });
    await Calculation.deleteMany({ userId });
    await mongoose.connection.close();
  });

  it('REQ-SEG-03: Debe descartar campos no permitidos al guardar un cálculo', async () => {
    // 1. Payload con datos válidos mezclados con inyección de campos hostiles
    const payloadContaminado = {
      principal: 1000,
      rate: 5,
      time: 2,
      type: 'Simple Interest',
      scriptMalicioso: "<script>alert('XSS')</script>", // Inyección
      campoFalso: "bypass_validation" // Inyección
    };

    const res = await request(app)
      .post('/api/calculator/simple-interest?save=true')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send(payloadContaminado);

    expect(res.statusCode).toBe(201);

    // Se revisa el objeto exacto que se guardó en MongoDB
    const calculoGuardado = await Calculation.findById(res.body._id);

    // LA PRUEBA: Se exige que los campos inyectados NO existan en la BD (undefined)
    expect(calculoGuardado.inputs.scriptMalicioso).toBeUndefined();
    expect(calculoGuardado.inputs.campoFalso).toBeUndefined();
  });
});