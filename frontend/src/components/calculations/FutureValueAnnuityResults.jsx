import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FiDownload, FiSave, FiCheck } from 'react-icons/fi';

// Registro de los módulos necesarios para usar gráficos Doughnut
ChartJS.register(ArcElement, Tooltip, Legend);

// Formateo de moneda: actualizado a USD (solicitud del usuario)
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

function FutureValueAnnuityResults({ results, onSave, isSaving, isSaved }) {

  // Resultados del cálculo: valor futuro, total depositado y total de interés generado
  const { futureValue, totalPrincipal, totalInterest } = results.outputs;

  // Configuración para el gráfico Doughnut
  const chartData = {
    labels: ['Total Depositado', 'Interés Ganado'],
    datasets: [
      {
        label: 'Composición del Valor Futuro',
        data: [totalPrincipal, totalInterest],
        backgroundColor: ['#10B981', '#4F46E5'],
        borderColor: ['#059669', '#4338CA'],
        borderWidth: 1,
      },
    ],
  };

  // Construcción del archivo CSV descargable
  const handleDownloadCSV = () => {
    const csvRows = [
      ["Concepto", "Valor"],
      ["Pago Periódico", results.inputs.payment],
      ["Tasa de Interés Anual (%)", results.inputs.rate],
      ["Tiempo (años)", results.inputs.time],
      ["Frecuencia (veces/año)", results.inputs.compoundsPerYear],
      ["Total Depositado (Principal)", totalPrincipal.toFixed(2)],
      ["Interés Total Ganado", totalInterest.toFixed(2)],
      ["Valor Futuro", futureValue.toFixed(2)]
    ];

    const csvString = csvRows.map(e => e.join(",")).join("\n");
    const bom = "\uFEFF"; // Para compatibilidad con Excel
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(bom + csvString);

    const link = document.createElement("a");
    link.href = csvContent;
    link.download = "calculo_valor_futuro_anualidad.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Resultados de Ahorro</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

        {/* Columna izquierda: valores numéricos */}
        <div className="space-y-4">

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Valor Futuro (Total Ahorrado)</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(futureValue)}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Depositado (Principal)</p>
            <p className="text-xl font-semibold text-gray-700">
              {formatCurrency(totalPrincipal)}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Interés Total Ganado</p>
            <p className="text-xl font-semibold text-indigo-600">
              {formatCurrency(totalInterest)}
            </p>
          </div>

        </div>

        {/* Columna derecha: gráfico Doughnut */}
        <div className="relative w-full max-w-xs mx-auto">
          <Doughnut data={chartData} />
        </div>

      </div>

      {/* Controles: guardar consulta y descargar CSV */}
      <div className="mt-6 flex space-x-3">

        {/* Guardado en historial */}
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

        {/* Exportación CSV */}
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

export default FutureValueAnnuityResults;
