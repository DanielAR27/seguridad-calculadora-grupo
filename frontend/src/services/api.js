import axios from 'axios';

// -------------------------------------------------------------
// 1. Instancia base de Axios
// -------------------------------------------------------------
// Esta instancia centraliza la URL base de la API y permite agregar
// interceptores que afecten a todas las solicitudes salientes.
// La URL se toma de las variables de entorno proporcionadas por Vite.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// -------------------------------------------------------------
// 2. Interceptor de solicitudes
// -------------------------------------------------------------
// Este interceptor se ejecuta antes de cada request y se encarga de:
// - Leer el token almacenado en localStorage
// - Adjuntarlo como encabezado Authorization si existe
// Esto garantiza que todas las peticiones autenticadas lleven el JWT.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Si ocurre un error antes de enviar la solicitud, se rechaza la promesa
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// 3. ENDPOINTS ORGANIZADOS
// -------------------------------------------------------------
// Se exportan objetos agrupados por dominio (auth y calculator)
// para mantener coherencia, orden y facilitar su uso desde React.

// -------------------- AUTENTICACIÓN ---------------------------
export const authApi = {
  // POST /auth/login
  // Recibe email y password, devuelve token + datos del usuario
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  // POST /auth/register
  // Crea un usuario: { email, password }
  register: (userData) => {
    return api.post('/auth/register', userData);
  }
};

// -------------------- CALCULADORA -----------------------------
export const calculatorApi = {

  // --- Cálculo sin guardar en historial ---
  calculateSimpleOnly: (data) => {
    return api.post('/calculator/simple-interest', data);
  },

  calculateCompoundOnly: (data) => {
    return api.post('/calculator/compound-interest', data);
  },

  calculateLoanOnly: (data) => {
    return api.post('/calculator/loan-payment', data);
  },

  calculateFvAnnuityOnly: (data) => {
    return api.post('/calculator/fv-annuity', data);
  },

  // --- Cálculo + guardado en historial ---
  saveSimpleCalculation: (data) => {
    return api.post('/calculator/simple-interest?save=true', data);
  },

  saveCompoundCalculation: (data) => {
    return api.post('/calculator/compound-interest?save=true', data);
  },

  saveLoanCalculation: (data) => {
    return api.post('/calculator/loan-payment?save=true', data);
  },

  saveFvAnnuityCalculation: (data) => {
    return api.post('/calculator/fv-annuity?save=true', data);
  },

  // --- Lectura de historial ---
  // GET /calculator/history
  getHistory: () => {
    return api.get('/calculator/history');
  },

  // GET /calculator/history/:id
  getHistoryById: (id) => {
    return api.get(`/calculator/history/${id}`);
  },

  // --- Eliminación de elementos del historial ---
  // DELETE /calculator/history/:id
  deleteHistoryItem: (id) => {
    return api.delete(`/calculator/history/${id}`);
  },
};

// Exportación de la instancia base (útil para casos especiales)
export default api;
