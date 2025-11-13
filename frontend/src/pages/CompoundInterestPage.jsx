import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculatorApi } from '../services/api';
import { FiAlertCircle, FiX } from 'react-icons/fi';

// Formulario y resultados de esta calculadora
import CompoundInterestForm from '../components/calculations/CompoundInterestForm';
import CompoundInterestResults from '../components/calculations/CompoundInterestResults';

function CompoundInterestPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [calculation, setCalculation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  // Ruta base para esta calculadora
  const baseRoute = '/calculator/compound-interest';

  // Efecto para cargar datos cuando abrimos un ID específico
  useEffect(() => {
    if (id) {
      const fetchCalculation = async () => {
        setIsLoading(true);
        try {
          // Cargar por ID desde el historial
          const response = await calculatorApi.getHistoryById(id);
          setCalculation(response.data);
          setIsSaved(true);
        } catch (err) {
          setError('No se pudo cargar el cálculo.');
          setCalculation(null);
          navigate(baseRoute); // Volver a la ruta base
        } finally {
          setIsLoading(false);
        }
      };
      fetchCalculation();
    } else {
      // Si no hay ID: limpiar estado y preparar “nuevo cálculo”
      setCalculation(null);
      setIsSaved(false);
    }
  }, [id, navigate]);

  // Cálculo (solo calcula; no guarda)
  const handleCalculate = async (formData) => {
    setCalculation(null);
    setIsLoading(true);
    setError('');

    try {
      const response = await calculatorApi.calculateCompoundOnly(formData);
      setCalculation(response.data);
      setIsSaved(false);

      // Si estábamos viendo un cálculo guardado, regresar a la ruta base
      if (id) {
        navigate(baseRoute);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Error en el cálculo');
      } else {
        setError('El servidor no responde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar cálculo en historial
  const handleSaveToHistory = async () => {
    if (!calculation || isSaved) return;

    setIsSaving(true);
    setError('');

    try {
      const response = await calculatorApi.saveCompoundCalculation(calculation.inputs);
      const savedCalculation = response.data;

      setCalculation(savedCalculation);
      setIsSaved(true);

      // Actualizar la URL con el ID creado
      navigate(`${baseRoute}/${savedCalculation._id}`, { replace: true });

    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Error al guardar');
      } else {
        setError('El servidor no responde.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {isSaved ? 'Viendo Cálculo Guardado' : 'Interés Compuesto'}
        </h2>
        {isSaved && (
          <button
            onClick={() => navigate(baseRoute)}
            className="text-sm text-green-600 hover:underline"
          >
            Nuevo Cálculo
          </button>
        )}
      </div>

      {/* Banner de Error */}
      {error && (
        <div className="w-full p-4 mb-4 flex items-center space-x-3 text-sm text-red-800 bg-red-100 border border-red-400 rounded-lg">
          <FiAlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="p-1 ml-auto"><FiX /></button>
        </div>
      )}

      {/* Formulario */}
      <CompoundInterestForm
        onCalculate={handleCalculate}
        defaultValues={calculation?.inputs}
        isLoading={isLoading}
      />

      {/* Resultados */}
      {calculation && (
        <CompoundInterestResults
          results={calculation}
          onSave={handleSaveToHistory}
          isSaving={isSaving}
          isSaved={isSaved}
        />
      )}
    </div>
  );
}

export default CompoundInterestPage;
