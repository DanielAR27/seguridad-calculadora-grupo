const express = require('express');
const router = express.Router();
const calculatorController = require('../controllers/calculator.controller');
const { verifyToken } = require('../middleware/auth.middleware');
// MITIGACIÓN 5.4.3 (Joyce): validadores con express-validator, rechazan inputs
// no numéricos ANTES de que lleguen al controlador.
const {
  simpleInterestValidator,
  compoundInterestValidator,
  loanPaymentValidator,
  futureValueAnnuityValidator,
} = require('../middleware/calculator.validator');

// Aplicamos el middleware de autenticación a TODAS las rutas de abajo
router.use(verifyToken);

// --- Rutas de Cálculo (POST) ---
router.post('/simple-interest', simpleInterestValidator, calculatorController.simpleInterest);
router.post('/compound-interest', compoundInterestValidator, calculatorController.compoundInterest);
router.post('/loan-payment', loanPaymentValidator, calculatorController.loanPayment);
router.post('/fv-annuity', futureValueAnnuityValidator, calculatorController.futureValueAnnuity);

// --- Ruta de Historial (GET) ---
router.get('/history', calculatorController.getHistory);

// --- Rutas de Historial Específico (:id) ---
router.get('/history/:id', calculatorController.getCalculationById);
router.delete('/history/:id', calculatorController.deleteCalculation);

module.exports = router;