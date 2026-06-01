/**
 * MITIGACIÓN 5.4.3 / REQ-SEG-JUM (Joyce):
 * Validación de tipos de datos en rutas de la calculadora con express-validator.
 *
 * Se valida y coerce cada campo matemático ANTES de que la petición llegue al
 * controlador. Esto previene que valores no numéricos, nulos o extremos (NaN)
 * causen comportamientos inesperados en la lógica financiera (Amenaza 4.4.3).
 *
 * La cadena .toFloat() / .toInt() coerce el valor validado a su tipo correcto,
 * por lo que el controlador recibe siempre un número JavaScript nativo.
 */

const { body, validationResult } = require('express-validator');

/**
 * Middleware que detiene la petición si express-validator encontró errores.
 * Debe ir al FINAL de cada array de validators, antes del controlador.
 */
const rejectIfInvalid = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ─── Reglas reutilizables ─────────────────────────────────────────────────

const positiveNumber = (field, label) =>
  body(field)
    .exists({ checkNull: true }).withMessage(`${label} es obligatorio.`)
    .isFloat({ gt: 0 }).withMessage(`${label} debe ser un número mayor a 0.`)
    .toFloat();

const validNumber = (field, label) =>
  body(field)
    .exists({ checkNull: true }).withMessage(`${label} es obligatorio.`)
    .isFloat().withMessage(`${label} debe ser un número válido.`)
    .toFloat();

const positiveInteger = (field, label) =>
  body(field)
    .exists({ checkNull: true }).withMessage(`${label} es obligatorio.`)
    .isInt({ gt: 0 }).withMessage(`${label} debe ser un entero mayor a 0.`)
    .toInt();

// ─── Validators por tipo de cálculo ──────────────────────────────────────

const simpleInterestValidator = [
  positiveNumber('principal', 'El monto principal (P)'),
  validNumber('rate', 'La tasa de interés (r)'),
  positiveNumber('time', 'El tiempo (t)'),
  rejectIfInvalid,
];

const compoundInterestValidator = [
  positiveNumber('principal', 'El monto principal (P)'),
  validNumber('rate', 'La tasa de interés (r)'),
  positiveNumber('time', 'El tiempo (t)'),
  positiveInteger('compoundsPerYear', 'La frecuencia de capitalización (n)'),
  rejectIfInvalid,
];

const loanPaymentValidator = [
  positiveNumber('principal', 'El monto principal (P)'),
  validNumber('rate', 'La tasa de interés (r)'),
  positiveInteger('time', 'El número de pagos (t)'),
  rejectIfInvalid,
];

const futureValueAnnuityValidator = [
  positiveNumber('payment', 'El pago periódico (Pmt)'),
  validNumber('rate', 'La tasa de interés (r)'),
  positiveNumber('time', 'El tiempo (t)'),
  positiveInteger('compoundsPerYear', 'La frecuencia de capitalización (n)'),
  rejectIfInvalid,
];

module.exports = {
  simpleInterestValidator,
  compoundInterestValidator,
  loanPaymentValidator,
  futureValueAnnuityValidator,
};
