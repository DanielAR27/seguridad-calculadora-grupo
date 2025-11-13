import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { calculatorApi } from '../services/api';
import { FiAlertCircle, FiTrash2, FiEye, FiCheckCircle, FiX } from 'react-icons/fi';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const successTimer = useRef(null);

  // Cargar historial al montar el componente
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await calculatorApi.getHistory();
        setHistory(response.data);
      } catch (err) {
        setError('No se pudo cargar el historial.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();

    // Limpiar temporizador de mensaje de éxito
    return () => {
      if (successTimer.current) {
        clearTimeout(successTimer.current);
      }
    };
  }, []);

  // Abrir modal de confirmación
  const openDeleteModal = (calculation) => {
    setItemToDelete(calculation);
    setIsModalOpen(true);
  };

  // Cerrar modal de confirmación
  const closeDeleteModal = () => {
    setItemToDelete(null);
    setIsModalOpen(false);
  };

  // Eliminar cálculo del historial
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await calculatorApi.deleteHistoryItem(itemToDelete._id);
      setHistory(prev => prev.filter(calc => calc._id !== itemToDelete._id));
      setSuccessMessage('Se ha borrado una consulta exitosamente');
      
      if (successTimer.current) {
        clearTimeout(successTimer.current);
      }
      successTimer.current = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

    } catch (err) {
      setError('Error al eliminar el cálculo. Intenta de nuevo.');
    } finally {
      closeDeleteModal();
    }
  };

  // Formato del tipo de cálculo
  const formatType = (type) => {
    switch(type) {
      case 'simpleInterest': return 'Interés Simple';
      case 'compoundInterest': return 'Interés Compuesto';
      case 'loanPayment': return 'Pago de Préstamo';
      case 'futureValueAnnuity': return 'Anualidad (Valor Futuro)';
      default: return type;
    }
  };

  // Ruta correcta según el tipo de cálculo
  const getCalculationUrl = (calculation) => {
    const typeToPath = {
      simpleInterest: 'simple-interest',
      compoundInterest: 'compound-interest',
      loanPayment: 'loan-payment',
      futureValueAnnuity: 'fv-annuity',
    };
    const path = typeToPath[calculation.calculationType];
    return `/calculator/${path}/${calculation._id}`;
  };

  return (
    <div className="container mx-auto">

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="w-full p-4 mb-4 flex items-center justify-between text-sm text-green-800 bg-green-100 border border-green-400 rounded-lg">
          <div className="flex items-center space-x-3">
            <FiCheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')}>
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Título + Bienvenida */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Historial de Cálculos
        </h2>

        <p className="text-gray-700 mt-1 text-sm">
          Bienvenido/a. Aquí puedes revisar, administrar y continuar tus cálculos guardados.
        </p>
      </div>

      {/* Estado de carga */}
      {isLoading && <p>Cargando historial...</p>}

      {/* Banner de error */}
      {error && (
        <div className="w-full p-4 mb-4 flex items-center space-x-3 text-sm text-red-800 bg-red-100 border border-red-400 rounded-lg">
          <FiAlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Sin historial */}
      {!isLoading && !error && history.length === 0 && (
        <p>No tienes cálculos guardados todavía.</p>
      )}

      {/* Tabla del historial */}
      {!isLoading && !error && history.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Cálculo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado Principal</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((calc) => (
                <tr key={calc._id} className="hover:bg-gray-50">

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(calc.createdAt).toLocaleString('es-ES')}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatType(calc.calculationType)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                    {calc.outputs.totalAmount && `$${calc.outputs.totalAmount.toFixed(2)}`}
                    {calc.outputs.finalAmount && `$${calc.outputs.finalAmount.toFixed(2)}`}
                    {calc.outputs.monthlyPayment && `$${calc.outputs.monthlyPayment.toFixed(2)} (Mensual)`}
                    {calc.outputs.futureValue && `$${calc.outputs.futureValue.toFixed(2)}`}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">

                    {/* Ver cálculo */}
                    <Link
                      to={getCalculationUrl(calc)}
                      className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-full"
                      title="Ver cálculo"
                    >
                      <FiEye className="w-5 h-5" />
                    </Link>

                    {/* Eliminar */}
                    <button
                      onClick={() => openDeleteModal(calc)}
                      className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full"
                      title="Eliminar"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {/* Modal de eliminación */}
      {isModalOpen && itemToDelete && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={closeDeleteModal}></div>

          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-50 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>

            <p className="my-4 text-gray-600">
              ¿Está seguro de eliminar su consulta de  
              <strong className="text-green-700"> "{formatType(itemToDelete.calculationType)}"</strong>?  
              Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={closeDeleteModal} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300">
                No, Cancelar
              </button>

              <button onClick={confirmDelete} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">
                Sí, Eliminar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default HistoryPage;
