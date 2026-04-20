import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiAlertCircle, FiCheckCircle, FiX, FiEye, FiEyeOff } from 'react-icons/fi';

function RegisterPage() {
  // Estados del formulario y mensajes
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const evaluatePasswordStrength = (pass) => {
    const hasLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    const score = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    let label = '';
    let bgColor = 'bg-gray-200';
    let textColor = 'text-gray-500';
    let width = 'w-0';

    if (pass.length > 0) {
      if (score === 4) {
        label = 'Fuerte';
        bgColor = 'bg-green-500';
        textColor = 'text-green-600';
        width = 'w-full';
      } else if (score >= 2) {
        label = 'Media';
        bgColor = 'bg-yellow-500';
        textColor = 'text-yellow-600';
        width = score === 3 ? 'w-3/4' : 'w-2/4';
      } else {
        label = 'Débil';
        bgColor = 'bg-red-500';
        textColor = 'text-red-600';
        width = 'w-1/4';
      }
    }

    return { score, label, bgColor, textColor, width, hasLength, hasUpper, hasNumber, hasSpecial, isStrong: score === 4 };
  };

  const strength = evaluatePasswordStrength(password);

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
            {/* Medidor de Fuerza Visual y Feedback */}
            {password && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-medium text-gray-700">Fuerza de la contraseña:</span>
                  <span className={`font-semibold ${strength.textColor}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                  <div className={`${strength.bgColor} h-1.5 rounded-full transition-all duration-300 ${strength.width}`}></div>
                </div>
                
                <ul className="text-xs space-y-1.5">
                  <li className={`flex items-center ${strength.hasLength ? 'text-green-600' : 'text-gray-500'}`}>
                    {strength.hasLength ? <FiCheckCircle className="mr-1.5 w-3.5 h-3.5" /> : <FiAlertCircle className="mr-1.5 w-3.5 h-3.5" />}
                    Mínimo 8 caracteres
                  </li>
                  <li className={`flex items-center ${strength.hasUpper ? 'text-green-600' : 'text-gray-500'}`}>
                    {strength.hasUpper ? <FiCheckCircle className="mr-1.5 w-3.5 h-3.5" /> : <FiAlertCircle className="mr-1.5 w-3.5 h-3.5" />}
                    Al menos una letra mayúscula
                  </li>
                  <li className={`flex items-center ${strength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    {strength.hasNumber ? <FiCheckCircle className="mr-1.5 w-3.5 h-3.5" /> : <FiAlertCircle className="mr-1.5 w-3.5 h-3.5" />}
                    Al menos un número
                  </li>
                  <li className={`flex items-center ${strength.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                    {strength.hasSpecial ? <FiCheckCircle className="mr-1.5 w-3.5 h-3.5" /> : <FiAlertCircle className="mr-1.5 w-3.5 h-3.5" />}
                    Al menos un carácter especial (@, $, !, %, *, etc.)
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Botón principal de registro */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !strength.isStrong}
              className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400 disabled:cursor-not-allowed"
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
