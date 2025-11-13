import React, { useState, useEffect } from 'react';

function CompoundInterestForm({ onCalculate, defaultValues, isLoading }) {

  // Estado del formulario, inicializado con valores por defecto (p. ej., cuando se carga desde historial)
  const [formData, setFormData] = useState({
    principal: defaultValues?.principal || '',
    rate: defaultValues?.rate || '',
    time: defaultValues?.time || '',
    compoundsPerYear: defaultValues?.compoundsPerYear || '12', // Frecuencia por defecto: mensual
  });

  // Actualizar campos cuando se reciban nuevos valores predeterminados
  useEffect(() => {
    if (defaultValues) {
      setFormData({
        principal: defaultValues.principal,
        rate: defaultValues.rate,
        time: defaultValues.time,
        compoundsPerYear: defaultValues.compoundsPerYear,
      });
    }
  }, [defaultValues]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Convertir a números y enviar los datos hacia el controlador de cálculo
  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
      principal: parseFloat(formData.principal),
      rate: parseFloat(formData.rate),
      time: parseFloat(formData.time),
      compoundsPerYear: parseInt(formData.compoundsPerYear),
    };
    onCalculate(dataToSend);
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Fila superior con datos principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Principal */}
          <div>
            <label htmlFor="principal" className="block text-sm font-medium text-gray-700">
              Monto Principal (P)
            </label>
            <input
              type="number"
              name="principal"
              id="principal"
              value={formData.principal}
              onChange={handleChange}
              required
              step="0.01"
              placeholder="Ej: 1000"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm
                         focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Tasa */}
          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
              Tasa Anual (r) %
            </label>
            <input
              type="number"
              name="rate"
              id="rate"
              value={formData.rate}
              onChange={handleChange}
              required
              step="0.01"
              placeholder="Ej: 5"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm
                         focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Tiempo */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Tiempo (t) (en años)
            </label>
            <input
              type="number"
              name="time"
              id="time"
              value={formData.time}
              onChange={handleChange}
              required
              step="0.01"
              placeholder="Ej: 2"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm
                         focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

        </div>

        {/* Fila inferior: frecuencia de composición */}
        <div>
          <label htmlFor="compoundsPerYear" className="block text-sm font-medium text-gray-700">
            Frecuencia de Composición (n)
          </label>
          <select
            name="compoundsPerYear"
            id="compoundsPerYear"
            value={formData.compoundsPerYear}
            onChange={handleChange}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm
                       focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="1">Anual (1)</option>
            <option value="2">Semestral (2)</option>
            <option value="4">Trimestral (4)</option>
            <option value="12">Mensual (12)</option>
            <option value="52">Semanal (52)</option>
            <option value="365">Diario (365)</option>
          </select>
        </div>

        {/* Botón de envío */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 mt-2 font-semibold text-white bg-green-600 rounded-md shadow-sm
                       hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500
                       focus:ring-offset-2 disabled:bg-green-400"
          >
            {isLoading ? 'Calculando...' : 'Calcular'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default CompoundInterestForm;
