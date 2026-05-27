/**
 * Tests de 5.4.3 / REQ-SEG-JUM (Joyce): Validación de Tipos de Datos con express-validator.
 *
 * Amenaza modelada (4.4.3): Los controladores asumen que los inputs son números
 * válidos. Enviar valores no numéricos, nulos o cadenas puede causar NaN o
 * comportamiento inesperado antes de que la lógica del controlador los rechace.
 *
 * Corrección: express-validator intercepta la petición en la capa de rutas
 * (ANTES del controlador), valida y coerce cada campo matemático, y retorna
 * HTTP 400 con errores estructurados si alguno es inválido.
 *
 * Patrón: tests que documentan la VULNERABILIDAD original seguidos de tests
 *         que verifican la CORRECCIÓN.
 */

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

const TEST_USER = { email: 'validator_test@test.com', password: 'Segura123!' };

describe('5.4.3 / REQ-SEG-JUM: Validación de Tipos con express-validator', () => {
  let agent;

  beforeAll(async () => {
    await User.deleteOne({ email: TEST_USER.email });
    await request(app).post('/api/auth/register').send(TEST_USER);
    agent = request.agent(app);
    await agent.post('/api/auth/login').send(TEST_USER);
  });

  afterAll(async () => {
    await User.deleteOne({ email: TEST_USER.email });
    await mongoose.connection.close();
  });

  // ─── Documenta la vulnerabilidad original ────────────────────────────────
  it('VULNERABLE (antes): sin express-validator, el controlador recibía payloads con campos faltantes o nulos', async () => {
    // Antes de express-validator, una petición con principal=null llegaba al
    // controlador, que evaluaba: typeof null !== 'number' → true → rechazaba.
    // El rechazo ocurría DENTRO del controlador, no en la capa de rutas.
    // Express-validator mueve esa defensa al nivel de middleware de rutas.
    // Este test documenta que con un body vacío ({}) el error debería
    // venir ahora de express-validator (campo "errors"), no del controlador.
    const res = await agent
      .post('/api/calculator/simple-interest')
      .send({});

    // Con express-validator: la respuesta tiene "errors" (array estructurado)
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  // ─── Verifica la corrección: Interés Simple ───────────────────────────────
  it('REQ-SEG-JUM: Debe rechazar principal no numérico ("abc") en interés simple', async () => {
    const res = await agent
      .post('/api/calculator/simple-interest')
      .send({ principal: 'abc', rate: 5, time: 2 });

    expect(res.statusCode).toBe(400);
    const campos = res.body.errors.map(e => e.path);
    expect(campos).toContain('principal');
  });

  it('REQ-SEG-JUM: Debe rechazar principal negativo o cero en interés simple', async () => {
    const negativo = await agent
      .post('/api/calculator/simple-interest')
      .send({ principal: -100, rate: 5, time: 2 });
    expect(negativo.statusCode).toBe(400);

    const cero = await agent
      .post('/api/calculator/simple-interest')
      .send({ principal: 0, rate: 5, time: 2 });
    expect(cero.statusCode).toBe(400);
  });

  it('REQ-SEG-JUM: Debe rechazar campos faltantes en interés simple', async () => {
    const res = await agent
      .post('/api/calculator/simple-interest')
      .send({ principal: 1000 }); // faltan rate y time

    expect(res.statusCode).toBe(400);
    const campos = res.body.errors.map(e => e.path);
    expect(campos).toContain('rate');
    expect(campos).toContain('time');
  });

  it('REQ-SEG-JUM: Debe aceptar valores numéricos válidos en interés simple', async () => {
    const res = await agent
      .post('/api/calculator/simple-interest')
      .send({ principal: 1000, rate: 5, time: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.outputs).toBeDefined();
  });

  // ─── Verifica la corrección: Interés Compuesto ────────────────────────────
  it('REQ-SEG-JUM: Debe rechazar compoundsPerYear no entero en interés compuesto', async () => {
    const res = await agent
      .post('/api/calculator/compound-interest')
      .send({ principal: 1000, rate: 5, time: 2, compoundsPerYear: 1.5 });

    expect(res.statusCode).toBe(400);
    const campos = res.body.errors.map(e => e.path);
    expect(campos).toContain('compoundsPerYear');
  });

  it('REQ-SEG-JUM: Debe aceptar payload válido en interés compuesto', async () => {
    const res = await agent
      .post('/api/calculator/compound-interest')
      .send({ principal: 1000, rate: 5, time: 2, compoundsPerYear: 12 });

    expect(res.statusCode).toBe(200);
    expect(res.body.outputs).toBeDefined();
  });

  // ─── Verifica la corrección: Pago de Préstamo ─────────────────────────────
  it('REQ-SEG-JUM: Debe rechazar time no entero en pago de préstamo', async () => {
    const res = await agent
      .post('/api/calculator/loan-payment')
      .send({ principal: 5000, rate: 3, time: 2.5 });

    expect(res.statusCode).toBe(400);
    const campos = res.body.errors.map(e => e.path);
    expect(campos).toContain('time');
  });

  it('REQ-SEG-JUM: Debe aceptar payload válido en pago de préstamo', async () => {
    const res = await agent
      .post('/api/calculator/loan-payment')
      .send({ principal: 5000, rate: 3, time: 24 });

    expect(res.statusCode).toBe(200);
    expect(res.body.outputs).toBeDefined();
  });

  // ─── Verifica la corrección: Valor Futuro de Anualidad ────────────────────
  it('REQ-SEG-JUM: Debe rechazar payment nulo en valor futuro de anualidad', async () => {
    const res = await agent
      .post('/api/calculator/fv-annuity')
      .send({ payment: null, rate: 5, time: 3, compoundsPerYear: 12 });

    expect(res.statusCode).toBe(400);
    const campos = res.body.errors.map(e => e.path);
    expect(campos).toContain('payment');
  });

  it('REQ-SEG-JUM: Debe aceptar payload válido en valor futuro de anualidad', async () => {
    const res = await agent
      .post('/api/calculator/fv-annuity')
      .send({ payment: 200, rate: 5, time: 3, compoundsPerYear: 12 });

    expect(res.statusCode).toBe(200);
    expect(res.body.outputs).toBeDefined();
  });
});
