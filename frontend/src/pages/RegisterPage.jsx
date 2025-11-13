import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';

function RegisterPage() {
  // Estados del formulario y mensajes
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Acceso a la función de registro del contexto de autenticación
  const { register } = useAuth();
  const navigate = useNavigate();

  // Temporizador para controlar la duración de mensajes
  const messageTimer = useRef(null);

  // Limpieza del temporizador al desmontar el componente
  useEffect(() => {
    return () => {
      if (messageTimer.current) {
        clearTimeout(messageTimer.current);
      }
    };
  }, []);

  // Manejo del envío del formulario de registro
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    if (messageTimer.current) {
      clearTimeout(messageTimer.current);
    }

    try {
      // Llamada al endpoint de registro
      await register(email, password);

      // Mensaje de confirmación y redirección automática
      setSuccess('¡Cuenta creada! Redirigiendo a login...');
      messageTimer.current = setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      // Manejo de errores provenientes del backend o red
      setError(err.message);
      messageTimer.current = setTimeout(() => {
        setError('');
      }, 4000);

      setIsSubmitting(false);
    }
  };

  // Cerrar manualmente los mensajes (error o éxito)
  const closeMessage = (type) => {
    if (type === 'error') setError('');
    if (type === 'success') setSuccess('');

    if (messageTimer.current) {
      clearTimeout(messageTimer.current);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-900">

      {/* Banner de error */}
      {error && (
        <div className="w-full max-w-md p-4 mb-4 flex items-center space-x-3 text-sm text-red-800 bg-red-100 border border-red-400 rounded-lg shadow-lg">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => closeMessage('error')} className="p-1">
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* Banner de éxito */}
      {success && (
        <div className="w-full max-w-md p-4 mb-4 flex items-center space-x-3 text-sm text-green-800 bg-green-100 border border-green-400 rounded-lg shadow-lg">
          <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{success}</span>
        </div>
      )}

      {/* Tarjeta del formulario */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Crear una Cuenta
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Campo de email */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
            />
          </div>

          {/* Campo de contraseña */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
            />
          </div>

          {/* Botón principal de registro */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </div>

          {/* Separador visual */}
          <hr className="my-6 border-gray-300" />

          {/* Enlace hacia login */}
          <p className="text-sm text-center text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <Link 
              to="/login" 
              className="font-medium text-green-500 hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
