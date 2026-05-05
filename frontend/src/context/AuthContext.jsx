import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../services/api';

// Contexto global de autenticación
const AuthContext = createContext();

// Proveedor principal del sistema de autenticación
export const AuthProvider = ({ children }) => {
  // Información del usuario autenticado
  const [user, setUser] = useState(null);

  // Estado que indica si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Indica si se está verificando la sesión inicial
  const [isLoading, setIsLoading] = useState(true);

  // MITIGACIÓN REQ-SEG-LMC-03: Al montar, verificar si existe una cookie de sesión activa.
  // El token nunca se lee desde JS — se valida exclusivamente en el servidor.
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await authApi.me();
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Iniciar sesión con credenciales
  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      const { user } = response.data;
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      logout();

      if (error.response) {
        throw new Error(error.response.data.error || 'Credenciales inválidas');
      } else if (error.request) {
        throw new Error('No se ha podido conectar con el servidor.');
      } else {
        throw new Error('Ha ocurrido un error inesperado.');
      }
    }
  };

  // Cerrar sesión: elimina la cookie en el servidor y limpia el estado local
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Si el servidor no responde, igual limpiamos el estado local
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  // Registro de usuarios (sin inicio de sesión automático)
  const register = async (email, password) => {
    try {
      await authApi.register({ email, password });
    } catch (error) {
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
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
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
