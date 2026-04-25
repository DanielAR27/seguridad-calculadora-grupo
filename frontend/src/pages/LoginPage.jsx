import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiAlertCircle, FiX, FiEye, FiEyeOff } from 'react-icons/fi';

function LoginPage() {
  // Estados para capturar las credenciales y manejar error/cargas
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Acceso a la función login del contexto de autenticación
  const { login } = useAuth();
  const navigate = useNavigate();

  // Temporizador usado para ocultar el banner de error
  const errorTimer = useRef(null);

  // Limpiar el temporizador cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (errorTimer.current) {
        clearTimeout(errorTimer.current);
      }
    };
  }, []);

  // Manejo del envío del formulario de login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Cancelación del temporizador previo (si existe)
    if (errorTimer.current) {
      clearTimeout(errorTimer.current);
    }

    try {
      // Intento de autenticación con el email y contraseña
      await login(email, password);

      // Redirección posterior al login exitoso
      navigate('/calculator');
    } catch (err) {
      // Captura del mensaje de error proveniente del contexto o backend
      setError(err.message);

      // Ocultar el error después de un tiempo
      errorTimer.current = setTimeout(() => {
        setError('');
      }, 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cerrar manualmente el banner de error
  const closeErrorBanner = () => {
    setError('');
    if (errorTimer.current) {
      clearTimeout(errorTimer.current);
    }
  };

  return (
    // Contenedor principal centrado
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-900">

      {/* Banner de error (si lo hay) */}
      {error && (
        <div className="w-full max-w-md p-4 mb-4 flex items-center space-x-3 text-sm text-red-800 bg-red-100 border border-red-400 rounded-lg shadow-lg">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={closeErrorBanner} className="p-1">
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tarjeta del formulario */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Iniciar Sesión
        </h2>
        
        {/* Formulario de autenticación */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Campo para el correo electrónico */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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

          {/* Campo para la contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Botón principal de acceso */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>

          {/* Separador visual */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <hr className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-400">
                o
              </span>
            </div>
          </div>

          {/* Enlace a registro */}
          <p className="text-sm text-center text-gray-400">
            ¿No tienes cuenta aún?{' '}
            <Link 
              to="/register" 
              className="font-medium text-green-500 hover:underline"
            >
              Regístrate aquí
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

export default LoginPage;
