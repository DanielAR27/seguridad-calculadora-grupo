const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema que representa un cálculo almacenado en el historial del usuario
const calculationSchema = new Schema(
  {
    // Usuario dueño del cálculo
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Tipo de cálculo realizado
    calculationType: {
      type: String,
      required: true,
      enum: ['simpleInterest', 'compoundInterest', 'loanPayment', 'futureValueAnnuity'],
    },

    // Datos ingresados por el usuario
    inputs: {
      type: Object,
      required: true,
    },

    // Resultado generado por el sistema
    outputs: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true, // Genera createdAt y updatedAt automáticamente
  }
);

const Calculation = mongoose.model('Calculation', calculationSchema);
module.exports = Calculation;
