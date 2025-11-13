import React, { useState, useEffect } from 'react';

function SimpleInterestForm({ onCalculate, defaultValues, isLoading }) {
  // Estado que almacena los valores del formulario, inicializando con valores por defecto si existen
  const [formData, setFormData] = useState({
    principal: defaultValues?.principal || '',
    rate: defaultValues?.rate || '',
    time: defaultValues?.time || '',
  });

  // Cuando los defaultValues cambian (por ejemplo, al cargar datos desde historial),
  // actualizamos el formulario para reflejar esos valores.
  useEffect(() => {
    if (defaultValues) {
      setFormData(defaultValues);
    }
  }, [defaultValues]);

  // Manejar cambios individuales en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Enviar los datos convertidos a número hacia la función del padre
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
        
        {/* Fila organizada en 3 columnas para los campos principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Campo: Monto Principal */}
          <div>
            <label htmlFor="principal" className="block text-sm font-medium text-gray-700">
              Monto Principal (P)
            </label>
            <input
              type="number" name="principal" id="principal"
              value={formData.principal}
              onChange={handleChange}
              required step="0.01" placeholder="Ej: 1000"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm
                         focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Campo: Tasa de Interés Anual */}
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

          {/* Campo: Tiempo en años */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Tiempo (t) (en años)
            </label>
            <input
              type="number" name="time" id="time"
              value={formData.time}
              onChange={handleChange}
              required step="1" placeholder="Ej: 2"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm
                         focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Botón principal para ejecutar el cálculo */}
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

export default SimpleInterestForm;
