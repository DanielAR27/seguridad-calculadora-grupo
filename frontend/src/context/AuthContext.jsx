import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../services/api';

// Contexto global de autenticación
const AuthContext = createContext();

// Proveedor principal del sistema de autenticación
export const AuthProvider = ({ children }) => {
  // Información del usuario autenticado
  const [user, setUser] = useState(null);

  // Token persistido en localStorage
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Estado que indica si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Indica si se está verificando la sesión inicial
  const [isLoading, setIsLoading] = useState(true);

  // Cargar token inicial desde localStorage al montar el componente
  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      // Validación remota del token podría agregarse aquí si fuera necesario
    }

    setIsLoading(false);
  }, []);

  // Iniciar sesión con credenciales
  const login = async (email, password) => {
    try {
      // Petición al backend para autenticar al usuario
      const response = await authApi.login(email, password);
      const { token, user } = response.data;

      // Guardar token para mantener sesión persistente
      localStorage.setItem('token', token);

      // Actualizar estado interno de autenticación
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);

    } catch (error) {
      // Ante fallo de login, limpiar cualquier sesión previa
      logout();

      if (error.response) {
        // Error proporcionado por el backend (credenciales inválidas, etc.)
        throw new Error(error.response.data.error || 'Credenciales inválidas');
      } else if (error.request) {
        // Fallo de red o servidor inaccesible
        throw new Error('No se ha podido conectar con el servidor.');
      } else {
        // Error inesperado en cliente
        throw new Error('Ha ocurrido un error inesperado.');
      }
    }
  };

  // Cerrar sesión y limpiar la información persistente
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Registro de usuarios (sin inicio de sesión automático)
  const register = async (email, password) => {
    try {
      // Petición al backend para crear nueva cuenta
      await authApi.register({ email, password });

      // El registro no implica autenticación automática
    } catch (error) {
      // Manejo de errores provenientes del servidor o de red
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al registrar la cuenta.');
      } else if (error.request) {
        throw new Error('No se ha podido conectar con el servidor.');
      } else {
        throw new Error('Ha ocurrido un error inesperado.');
      }
    }
  };

  return (
    // Exposición de los valores y funciones necesarias al resto de la aplicación
    <AuthContext.Provider 
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para consumir el contexto desde cualquier componente
export const useAuth = () => {
  return useContext(AuthContext);
};
