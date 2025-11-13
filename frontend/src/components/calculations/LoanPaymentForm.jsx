import React, { useState, useEffect } from 'react';

function LoanPaymentForm({ onCalculate, defaultValues, isLoading }) {
  // Estado local del formulario que almacena los valores de entrada para el cálculo del préstamo
  const [formData, setFormData] = useState({
    principal: defaultValues?.principal || '',
    rate: defaultValues?.rate || '',
    time: defaultValues?.time || '',
  });

  // Cuando se cargan valores desde el historial, el formulario se actualiza automáticamente
  useEffect(() => {
    if (defaultValues) {
      setFormData(defaultValues);
    }
  }, [defaultValues]);

  // Maneja los cambios en los campos del formulario, manteniendo sincronizado el estado local
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Convierte los valores a números y los envía al componente padre para realizar el cálculo
  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
      principal: parseFloat(formData.principal),
      rate: parseFloat(formData.rate),
      time: parseFloat(formData.time),
    };
    onCalculate(dataToSend);
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Fila con los inputs principales para el cálculo del préstamo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Monto del préstamo */}
          <div>
            <label htmlFor="principal" className="block text-sm font-medium text-gray-700">
              Monto del Préstamo (P)
            </label>
            <input
              type="number" name="principal" id="principal"
              value={formData.principal}
              onChange={handleChange}
              required step="0.01" placeholder="Ej: 150000"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm 
                         focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Tasa de interés anual */}
          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
              Tasa Anual (r) %
            </label>
            <input
              type="number" name="rate" id="rate"
              value={formData.rate}
              onChange={handleChange}
              required step="0.01" placeholder="Ej: 8.5"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm 
                         focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Número total de pagos (mensuales) */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Pagos (t) (en meses)
            </label>
            <input
              type="number" name="time" id="time"
              value={formData.time}
              onChange={handleChange}
              required step="1" placeholder="Ej: 360" // 30 años = 360 meses
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm 
                         focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

        </div>

        {/* Botón que ejecuta el cálculo del pago mensual */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 mt-2 font-semibold text-white bg-green-600 rounded-md 
                       shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 
                       focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400"
          >
            {isLoading ? 'Calculando...' : 'Calcular Pago Mensual'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default LoanPaymentForm;
