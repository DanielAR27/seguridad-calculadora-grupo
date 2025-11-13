import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FiDownload, FiSave, FiCheck } from 'react-icons/fi';

// Registro de elementos necesarios para Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Formato estándar para mostrar valores monetarios
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// Traducción de la frecuencia n -> texto claro
const formatFrequency = (n) => {
  const map = {
    1: 'Anual', 2: 'Semestral', 4: 'Trimestral', 12: 'Mensual',
    52: 'Semanal', 365: 'Diario'
  };
  return map[n] || n;
};

function CompoundInterestResults({ results, onSave, isSaving, isSaved }) {

  // Datos del gráfico (composición del monto final)
  const chartData = {
    labels: ['Principal Invertido', 'Interés Total Generado'],
    datasets: [
      {
        label: 'Composición del Monto Final',
        data: [results.inputs.principal, results.outputs.totalInterest],
        backgroundColor: ['#10B981', '#34D399'],
        borderColor: ['#059669', '#10B981'],
        borderWidth: 1,
      },
    ],
  };

  // Opciones del gráfico: leyenda inferior y proporción mantenida
  const chartOptions = {
    plugins: {
      legend: {
        position: 'top',
      }
    },
    responsive: true,
    maintainAspectRatio: true,
  };

  // Exportación en formato CSV para Excel
  const handleDownloadCSV = () => {
    const csvRows = [
      ["Concepto", "Valor"],
      ["Monto Principal", results.inputs.principal],
      ["Tasa de Interés (%)", results.inputs.rate],
      ["Tiempo (años)", results.inputs.time],
      ["Frecuencia (n)", formatFrequency(results.inputs.compoundsPerYear)],
      ["Interés Total Generado", results.outputs.totalInterest.toFixed(2)],
      ["Monto Final", results.outputs.finalAmount.toFixed(2)]
    ];

    const csvString = csvRows.map(e => e.join(",")).join("\n");
    const bom = "\uFEFF"; // Para compatibilidad en Excel

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(bom + csvString);
    const link = document.createElement("a");
    link.href = csvContent;
    link.download = "calculo_interes_compuesto.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Resultados del Cálculo</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

        {/* Resultados numéricos */}
        <div className="space-y-4">

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Monto Final</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(results.outputs.finalAmount)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Invertido (Principal)</p>
              <p className="text-xl font-semibold text-gray-700">
                {formatCurrency(results.inputs.principal)}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Interés Total Generado</p>
              <p className="text-xl font-semibold text-gray-800">
                {formatCurrency(results.outputs.totalInterest)}
              </p>
            </div>

          </div>
        </div>

        {/* Gráfico tipo dona */}
        <div className="relative w-full max-w-xs mx-auto">
          <Doughnut data={chartData} options={chartOptions} />
        </div>

      </div>

      {/* Acciones de guardado y descarga */}
      <div className="mt-6 flex space-x-3">

        {/* Guardar en historial */}
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

        {/* Descargar CSV */}
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

export default CompoundInterestResults;
