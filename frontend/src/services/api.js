import axios from 'axios';

// -------------------------------------------------------------
// 1. Instancia base de Axios
// -------------------------------------------------------------
// MITIGACIÓN REQ-SEG-LMC-03: withCredentials permite que el navegador envíe
// automáticamente la cookie HttpOnly en cada petición — el token nunca toca JS.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// -------------------------------------------------------------
// 2. ENDPOINTS ORGANIZADOS
// -------------------------------------------------------------

// -------------------- AUTENTICACIÓN ---------------------------
export const authApi = {
  // POST /auth/login — establece la cookie HttpOnly en el servidor
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  // POST /auth/register
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  // POST /auth/logout — elimina la cookie en el servidor
  logout: () => {
    return api.post('/auth/logout');
  },

  // GET /auth/me — verifica la cookie activa y retorna datos del usuario
  me: () => {
    return api.get('/auth/me');
  },
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
  getHistory: () => {
    return api.get('/calculator/history');
  },

  getHistoryById: (id) => {
    return api.get(`/calculator/history/${id}`);
  },

  // --- Eliminación de elementos del historial ---
  deleteHistoryItem: (id) => {
    return api.delete(`/calculator/history/${id}`);
  },
};

export default api;
