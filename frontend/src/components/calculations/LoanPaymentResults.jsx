import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FiDownload, FiSave, FiCheck } from 'react-icons/fi';

// Registro de módulos necesarios para gráficos Doughnut en Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Formateador de moneda para mostrar valores en USD (cambio solicitado)
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// Componente de resultados del cálculo de préstamos
function LoanPaymentResults({ results, onSave, isSaving, isSaved }) {
  
  // Desestructuración de los valores entregados por el servicio de cálculo
  const { monthlyPayment, totalInterest, totalPayment } = results.outputs;
  const { principal } = results.inputs;

  // Datos del gráfico: compara capital vs interés total pagado
  const chartData = {
    labels: ['Monto del Préstamo (Principal)', 'Interés Total Pagado'],
    datasets: [
      {
        label: 'Composición del Pago Total',
        data: [principal, totalInterest],
        backgroundColor: ['#10B981', '#F59E0B'],
        borderColor: ['#059669', '#D97706'],
        borderWidth: 1,
      },
    ],
  };

  // Generación del archivo CSV descargable con el detalle del cálculo
  const handleDownloadCSV = () => {
    const csvRows = [
      ["Concepto", "Valor"],
      ["Monto del Préstamo", principal],
      ["Tasa de Interés (%)", results.inputs.rate],
      ["Plazo (meses)", results.inputs.time],
      ["Pago Mensual", monthlyPayment.toFixed(2)],
      ["Interés Total Pagado", totalInterest.toFixed(2)],
      ["Costo Total (Principal + Interés)", totalPayment.toFixed(2)]
    ];

    // Convertir filas a texto CSV
    const csvString = csvRows.map(row => row.join(",")).join("\n");

    // BOM para evitar problemas con caracteres especiales en Excel
    const bom = "\uFEFF";

    // Crear URI de descarga codificada
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(bom + csvString);

    // Simular un clic en un enlace invisible para descargar el archivo
    const link = document.createElement("a");
    link.href = csvContent;
    link.download = "calculo_pago_prestamo.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      {/* Encabezado de la sección */}
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Resultados del Préstamo</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

        {/* Columna izquierda: valores numéricos */}
        <div className="space-y-4">

          {/* Pago mensual resultante */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Pago Mensual</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyPayment)}
            </p>
          </div>

          {/* Costo total del préstamo */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Costo Total (Principal + Interés)</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(totalPayment)}
            </p>
          </div>

          {/* Interés total pagado durante toda la vida del préstamo */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Interés Total Pagado</p>
            <p className="text-xl font-semibold text-amber-600">
              {formatCurrency(totalInterest)}
            </p>
          </div>
        </div>

        {/* Columna derecha: gráfico Doughnut */}
        <div className="relative w-full max-w-xs mx-auto">
          <Doughnut data={chartData} />
        </div>
      </div>

      {/* Botones de acción: guardar resultado y exportar CSV */}
      <div className="mt-6 flex space-x-3">

        {/* Guardar en historial con cambio visual según estado */}
        <button
          onClick={onSave}
          disabled={isSaving || isSaved}
          className={`inline-flex items-center px-4 py-2 space-x-2 text-sm font-medium rounded-md
            ${isSaved 
              ? 'bg-gray-200 text-gray-500'
              : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
            }`}
        >
          {isSaved ? <FiCheck /> : (isSaving ? <FiSave className="animate-spin" /> : <FiSave />)}
          <span>
            {isSaved ? 'Guardado en historial' : (isSaving ? 'Guardando...' : 'Guardar consulta')}
          </span>
        </button>

        {/* Descarga del archivo CSV */}
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

export default LoanPaymentResults;
