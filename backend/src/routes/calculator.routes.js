const express = require('express');
const router = express.Router();
const calculatorController = require('../controllers/calculator.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Aplicamos el middleware de autenticación a TODAS las rutas de abajo
router.use(verifyToken);

// --- Rutas de Cálculo (POST) ---
router.post('/simple-interest', calculatorController.simpleInterest);
router.post('/compound-interest', calculatorController.compoundInterest);
router.post('/loan-payment', calculatorController.loanPayment);
router.post('/fv-annuity', calculatorController.futureValueAnnuity);

// --- Ruta de Historial (GET) ---
router.get('/history', calculatorController.getHistory);

// --- Rutas de Historial Específico (:id) ---
router.get('/history/:id', calculatorController.getCalculationById);
router.delete('/history/:id', calculatorController.deleteCalculation);

module.exports = router;