import React, { useState, useEffect } from 'react';

function FutureValueAnnuityForm({ onCalculate, defaultValues, isLoading }) {
  // Estado local para los 4 parámetros: pago, tasa, tiempo y frecuencia de composición
  const [formData, setFormData] = useState({
    payment: defaultValues?.payment || '',
    rate: defaultValues?.rate || '',
    time: defaultValues?.time || '',
    compoundsPerYear: defaultValues?.compoundsPerYear || '',
  });

  // Si el usuario carga una consulta previa desde el historial, refresca los valores del formulario
  useEffect(() => {
    if (defaultValues) {
      setFormData(defaultValues);
    }
  }, [defaultValues]);

  // Actualiza el estado cada vez que el usuario escribe un valor nuevo
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Envía los datos convertidos a número para su cálculo
  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
      payment: parseFloat(formData.payment),
      rate: parseFloat(formData.rate),
      time: parseFloat(formData.time),
      compoundsPerYear: parseFloat(formData.compoundsPerYear),
    };
    onCalculate(dataToSend);
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Grupo 2x2 para los cuatro parámetros principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Pago periódico */}
          <div>
            <label htmlFor="payment" className="block text-sm font-medium text-gray-700">
              Pago Periódico (Pmt)
            </label>
            <input
              type="number" name="payment" id="payment"
              value={formData.payment}
              onChange={handleChange}
              required step="0.01" placeholder="Ej: 100"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm
                         focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Tasa anual */}
          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
              Tasa Anual (r) %
            </label>
            <input
              type="number" name="rate" id="rate"
              value={formData.rate}
              onChange={handleChange}
              required step="0.01" placeholder="Ej: 5"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm
                         focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Tiempo en años */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Tiempo (t) (en años)
            </label>
            <input
              type="number" name="time" id="time"
              value={formData.time}
              onChange={handleChange}
              required step="1" placeholder="Ej: 10"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm
                         focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Frecuencia de composición */}
          <div>
            <label htmlFor="compoundsPerYear" className="block text-sm font-medium text-gray-700">
              Frecuencia (n) (veces/año)
            </label>
            <input
              type="number" name="compoundsPerYear" id="compoundsPerYear"
              value={formData.compoundsPerYear}
              onChange={handleChange}
              required step="1" placeholder="Ej: 12 (para mensual)"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm
                         focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Botón principal */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 mt-2 font-semibold text-white bg-green-600 rounded-md shadow-sm
                       hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500
                       focus:ring-offset-2 disabled:bg-green-400"
          >
            {isLoading ? 'Calculando...' : 'Calcular Valor Futuro'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default FutureValueAnnuityForm;
