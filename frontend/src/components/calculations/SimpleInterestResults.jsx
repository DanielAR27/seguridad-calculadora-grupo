import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FiDownload, FiSave, FiCheck } from 'react-icons/fi';

// Registro de módulos necesarios para Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Utilidad para formatear valores monetarios
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// Componente que muestra resultados numéricos, gráfico y opciones de guardado/descarga
function SimpleInterestResults({ results, onSave, isSaving, isSaved }) {

  // Configuración del gráfico tipo dona
  const chartData = {
    labels: ['Principal', 'Interés Generado'],
    datasets: [
      {
        label: 'Composición del Monto Total',
        data: [results.inputs.principal, results.outputs.interest],
        backgroundColor: ['#10B981', '#34D399'],
        borderColor: ['#059669', '#10B981'],
        borderWidth: 1,
      },
    ],
  };

  // Generador de archivo CSV incluyendo BOM para compatibilidad con Excel
  const handleDownloadCSV = () => {
    const csvRows = [
      ["Concepto", "Valor"],
      ["Monto Principal", results.inputs.principal],
      ["Tasa de Interés (%)", results.inputs.rate],
      ["Tiempo (años)", results.inputs.time],
      ["Interés Generado", results.outputs.interest.toFixed(2)],
      ["Monto Total", results.outputs.totalAmount.toFixed(2)]
    ];

    const csvString = csvRows.map(e => e.join(",")).join("\n");
    const bom = "\uFEFF"; // Para evitar problemas con caracteres especiales

    const csvContent =
      "data:text/csv;charset=utf-8," + encodeURIComponent(bom + csvString);

    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "calculo_interes_simple.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Resultados del Cálculo</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

        {/* Zona de resultados numéricos */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Interés Generado</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(results.outputs.interest)}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Monto Total (Principal + Interés)</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(results.outputs.totalAmount)}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Monto Principal</p>
            <p className="text-xl font-semibold text-gray-700">
              {formatCurrency(results.inputs.principal)}
            </p>
          </div>
        </div>

        {/* Zona del gráfico */}
        <div className="relative w-full max-w-xs mx-auto">
          <Doughnut data={chartData} />
        </div>
      </div>

      {/* Controles: Guardar y descargar CSV */}
      <div className="mt-6 flex space-x-3">

        {/* Botón: Guardar en historial */}
        <button
          onClick={onSave}
          disabled={isSaving || isSaved}
          className={`inline-flex items-center px-4 py-2 space-x-2 text-sm font-medium rounded-md
            ${isSaved 
              ? 'bg-gray-200 text-gray-500'
              : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
            }`}
        >
          {isSaved ? <FiCheck /> :
            (isSaving ? <FiSave className="animate-spin" /> : <FiSave />)}

          <span>
            {isSaved ? 'Guardado en historial' :
            (isSaving ? 'Guardando...' : 'Guardar consulta')}
          </span>
        </button>

        {/* Botón: Descargar CSV */}
        <button
          onClick={handleDownloadCSV}
          className="inline-flex items-center px-4 py-2 space-x-2 text-sm font-medium
                     text-green-700 bg-green-100 rounded-md hover:bg-green-200"
        >
          <FiDownload />
          <span>Descargar como CSV</span>
        </button>
      </div>
    </div>
  );
}

export default SimpleInterestResults;
