import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import CalculatorLayout from './components/CalculatorLayout';

// Páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HistoryPage from './pages/HistoryPage';
import SimpleInterestPage from './pages/SimpleInterestPage';
import CompoundInterestPage from './pages/CompoundInterestPage';
import LoanPaymentPage from './pages/LoanPaymentPage';
import FVAnnuityPage from './pages/FutureValueAnnuityPage';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-900 text-white">
        Cargando...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/calculator" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/calculator" />} />

        {/* --- Rutas Privadas (Anidadas) --- */}
        <Route
          path="/calculator"
          element={isAuthenticated ? <CalculatorLayout /> : <Navigate to="/login" />}
        >
          {/* Páginas Hijas */}
          <Route path="history" element={<HistoryPage />} />
          <Route path="simple-interest/:id?" element={<SimpleInterestPage />} />
          <Route path="compound-interest/:id?" element={<CompoundInterestPage />} />
          <Route path="loan-payment/:id?" element={<LoanPaymentPage />} />
          <Route path="fv-annuity/:id?" element={<FVAnnuityPage />} />

          <Route index element={<Navigate to="history" replace />} />
        </Route>

        {/* --- Redirección Comodín --- */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/calculator' : '/login'} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;