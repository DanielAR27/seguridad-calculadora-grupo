const calculatorService = require('../services/calculator.service.js');
const Calculation = require('../models/Calculation.model.js');

/**
 * Calcula Interés Simple.
 * Puede devolver el resultado solamente o guardarlo si ?save=true.
 */
const simpleInterest = async (req, res) => {
  try {
    const data = req.body;
    const shouldSave = req.query.save === 'true';

    // Validaciones básicas de entrada
    if (typeof data.principal !== 'number' || isNaN(data.principal) || data.principal <= 0) {
      return res.status(400).json({ error: 'El monto principal (P) debe ser un número mayor a 0.' });
    }
    if (typeof data.time !== 'number' || isNaN(data.time) || data.time <= 0) {
      return res.status(400).json({ error: 'El tiempo (t) debe ser un número mayor a 0.' });
    }
    if (typeof data.rate !== 'number' || isNaN(data.rate)) {
      return res.status(400).json({ error: 'La tasa de interés (r) debe ser un número válido.' });
    }

    const result = calculatorService.calculateSimpleInterest(data);

    // Guardar en historial si el usuario lo solicita
    if (shouldSave) {
      const newCalculation = new Calculation({
        user: req.user.userId,
        calculationType: 'simpleInterest',
        inputs: data,
        outputs: result,
      });
      await newCalculation.save();
      return res.status(201).json(newCalculation);
    }

    // Envío de resultado sin persistencia
    res.status(200).json({ inputs: data, outputs: result });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Calcula Interés Compuesto.
 */
const compoundInterest = async (req, res) => {
  try {
    const data = req.body;
    const shouldSave = req.query.save === 'true';

    // Validaciones
    if (typeof data.principal !== 'number' || isNaN(data.principal) || data.principal <= 0) {
      return res.status(400).json({ error: 'El monto principal (P) debe ser un número mayor a 0.' });
    }
    if (typeof data.time !== 'number' || isNaN(data.time) || data.time <= 0) {
      return res.status(400).json({ error: 'El tiempo (t) debe ser un número mayor a 0.' });
    }
    if (typeof data.rate !== 'number' || isNaN(data.rate)) {
      return res.status(400).json({ error: 'La tasa de interés (r) debe ser un número válido.' });
    }
    if (typeof data.compoundsPerYear !== 'number' || isNaN(data.compoundsPerYear) || data.compoundsPerYear <= 0 || !Number.isInteger(data.compoundsPerYear)) {
      return res.status(400).json({ error: 'La frecuencia (n) debe ser un entero mayor a 0.' });
    }

    const result = calculatorService.calculateCompoundInterest(data);

    if (shouldSave) {
      const newCalculation = new Calculation({
        user: req.user.userId,
        calculationType: 'compoundInterest',
        inputs: data,
        outputs: result,
      });
      await newCalculation.save();
      return res.status(201).json(newCalculation);
    }

    res.status(200).json({ inputs: data, outputs: result });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Calcula Pago de Préstamo (cuota mensual).
 */
const loanPayment = async (req, res) => {
  try {
    const data = req.body;
    const shouldSave = req.query.save === 'true';

    // Validaciones
    if (typeof data.principal !== 'number' || isNaN(data.principal) || data.principal <= 0) {
      return res.status(400).json({ error: 'El monto principal (P) debe ser un número mayor a 0.' });
    }
    if (typeof data.rate !== 'number' || isNaN(data.rate)) {
      return res.status(400).json({ error: 'La tasa de interés (r) debe ser un número válido.' });
    }
    if (typeof data.time !== 'number' || isNaN(data.time) || data.time <= 0 || !Number.isInteger(data.time)) {
      return res.status(400).json({ error: 'El número de pagos (t) debe ser un entero mayor a 0.' });
    }

    const result = calculatorService.calculateLoanPayment(data);

    if (shouldSave) {
      const newCalculation = new Calculation({
        user: req.user.userId,
        calculationType: 'loanPayment',
        inputs: data,
        outputs: result,
      });
      await newCalculation.save();
      return res.status(201).json(newCalculation);
    }

    res.status(200).json({ inputs: data, outputs: result });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Calcula Valor Futuro de una Anualidad.
 */
const futureValueAnnuity = async (req, res) => {
  try {
    const data = req.body;
    const shouldSave = req.query.save === 'true';

    // Validaciones
    if (typeof data.payment !== 'number' || isNaN(data.payment) || data.payment <= 0) {
      return res.status(400).json({ error: 'El pago periódico (Pmt) debe ser mayor a 0.' });
    }
    if (typeof data.rate !== 'number' || isNaN(data.rate)) {
      return res.status(400).json({ error: 'La tasa de interés (r) debe ser válida.' });
    }
    if (typeof data.time !== 'number' || isNaN(data.time) || data.time <= 0) {
      return res.status(400).json({ error: 'El tiempo (t) debe ser mayor a 0.' });
    }
    if (typeof data.compoundsPerYear !== 'number' || isNaN(data.compoundsPerYear) || data.compoundsPerYear <= 0 || !Number.isInteger(data.compoundsPerYear)) {
      return res.status(400).json({ error: 'La frecuencia (n) debe ser un entero mayor a 0.' });
    }

    const result = calculatorService.calculateFutureValueAnnuity(data);

    if (shouldSave) {
      const newCalculation = new Calculation({
        user: req.user.userId,
        calculationType: 'futureValueAnnuity',
        inputs: data,
        outputs: result,
      });
      await newCalculation.save();
      return res.status(201).json(newCalculation);
    }

    res.status(200).json({ inputs: data, outputs: result });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Obtiene el listado de cálculos del usuario.
 */
const getHistory = async (req, res) => {
  try {
    const calculations = await Calculation.find({
      user: req.user.userId
    })
    .sort({ createdAt: -1 })
    .limit(20);

    res.status(200).json(calculations);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial.' });
  }
};

/**
 * Obtiene un cálculo específico por ID.
 */
const getCalculationById = async (req, res) => {
  try {
    const calculation = await Calculation.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!calculation) {
      return res.status(404).json({ error: 'Cálculo no encontrado.' });
    }

    res.status(200).json(calculation);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el cálculo.' });
  }
};

/**
 * Elimina un cálculo del historial.
 */
const deleteCalculation = async (req, res) => {
  try {
    const calculation = await Calculation.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!calculation) {
      return res.status(404).json({ error: 'Cálculo no encontrado.' });
    }

    res.status(200).json({ message: 'Cálculo eliminado', id: calculation._id });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el cálculo.' });
  }
};

module.exports = {
  simpleInterest,
  compoundInterest,
  loanPayment,
  futureValueAnnuity,
  getHistory,
  getCalculationById,
  deleteCalculation
};
