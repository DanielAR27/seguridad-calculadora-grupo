/**
 * Valida que todos los valores proporcionados sean números positivos.
 * Lanza error en caso de encontrar un valor inválido.
 */
const validateInputs = (inputs) => {
  for (const key in inputs) {
    const value = inputs[key];
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      throw new Error(`El valor de '${key}' debe ser un número positivo.`);
    }
  }
};

/**
 * Interés simple: I = P * r * t.
 * Rate se interpreta como porcentaje (ej: 5 => 5%).
 */
const calculateSimpleInterest = (data) => {
  const { principal, rate, time } = data;
  validateInputs({ principal, rate, time });

  const interestRate = rate / 100;
  const interest = principal * interestRate * time;
  const totalAmount = principal + interest;

  return { 
    principal,
    rate,
    time,
    interest,
    totalAmount,
  };
};

/**
 * Interés compuesto: A = P(1 + r/n)^(nt).
 * Rate es porcentaje; n y t deben ser positivos.
 */
const calculateCompoundInterest = (data) => {
  const { principal, rate, time, compoundsPerYear } = data;
  validateInputs({ principal, rate, time, compoundsPerYear });

  if (compoundsPerYear === 0) {
    throw new Error("'compoundsPerYear' no puede ser cero.");
  }

  const interestRate = rate / 100;
  const n = compoundsPerYear;
  const t = time;

  const finalAmount = principal * Math.pow((1 + interestRate / n), n * t);
  const totalInterest = finalAmount - principal;

  return {
    principal,
    rate,
    time,
    compoundsPerYear,
    totalInterest,
    finalAmount,
  };
};

/**
 * Pago mensual de préstamo (amortización).
 * Fórmula estándar: M = P[i(1+i)^n] / [(1+i)^n – 1]
 */
const calculateLoanPayment = (data) => {
  const { principal, rate, time } = data;

  const i = rate / 100 / 12; // Conversión de tasa anual (%) a mensual decimal
  const n = time;            // Total de meses

  const numerator = i * Math.pow(1 + i, n);
  const denominator = Math.pow(1 + i, n) - 1;
  const monthlyPayment = principal * (numerator / denominator);

  const totalPayment = monthlyPayment * n;
  const totalInterest = totalPayment - principal;

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
  };
};

/**
 * Valor Futuro de una Anualidad:
 * FV = Pmt * [ ((1 + r/n)^(nt) - 1) / (r/n) ]
 */
const calculateFutureValueAnnuity = (data) => {
  const { payment, rate, time, compoundsPerYear } = data;

  const r = rate / 100;
  const n = compoundsPerYear;
  const t = time;
  const pmt = payment;

  const ratePerPeriod = r / n;
  const numPeriods = n * t;

  const futureValue = pmt * ((Math.pow(1 + ratePerPeriod, numPeriods) - 1) / ratePerPeriod);

  const totalPrincipal = pmt * numPeriods;
  const totalInterest = futureValue - totalPrincipal;

  return {
    futureValue,
    totalPrincipal,
    totalInterest,
  };
};

module.exports = {
  calculateSimpleInterest,
  calculateCompoundInterest,
  calculateLoanPayment,
  calculateFutureValueAnnuity,
};
