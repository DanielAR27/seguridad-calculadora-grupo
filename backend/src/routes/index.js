const express = require('express');
const router = express.Router();

// Importamos las rutas
const authRoutes = require('./auth.routes');
const calculatorRoutes = require('./calculator.routes');

// "Montamos" las rutas en sus prefijos
router.use('/auth', authRoutes);
router.use('/calculator', calculatorRoutes);

module.exports = router;