import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiLogOut, 
  FiChevronDown,
  FiChevronUp,
  FiClock, 
  FiBarChart2, 
  FiTrendingUp, 
  FiFileText, 
  FiRepeat 
} from 'react-icons/fi';

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Control del estado del menú desplegable
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Referencia para detectar clics fuera del menú
  const dropdownRef = useRef(null);

  // Manejo de cierre de sesión
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Detectar clic fuera del dropdown para cerrarlo automáticamente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Estilo base para cada elemento del menú
  const linkStyle = "flex items-center w-full px-4 py-3 text-sm text-gray-100 hover:bg-green-600";

  // Estilo cuando la ruta está activa
  const activeLinkStyle = `${linkStyle} bg-green-500 font-bold text-white`;

  return (
    /* 
      Barra superior de navegación del área "calculator".
      Incluye opciones principales y un menú desplegable con accesos directos.
    */
    <nav className="flex items-center justify-between p-4 bg-green-700 text-white shadow-md z-30">
      
      {/* Identidad visual de la aplicación */}
      <h1 className="text-xl font-bold">
        Calculadora Financiera
      </h1>

      {/* Contenedor de acciones en la esquina derecha */}
      <div className="flex items-center space-x-4">
        
        {/* Botón de cierre de sesión */}
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-2 space-x-2 font-medium bg-green-800 rounded-md hover:bg-green-900 focus:outline-none"
        >
          <FiLogOut />
          <span>Cerrar Sesión</span>
        </button>

        {/* Menú desplegable de cálculos */}
        <div className="relative" ref={dropdownRef}>

          {/* Botón que controla la apertura/cierre del menú */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-3 py-2 space-x-2 font-medium bg-green-800 rounded-md hover:bg-green-900 focus:outline-none"
          >
            <span>Cálculos</span>
            {isDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {/* Contenedor del dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-4 w-64 bg-green-700 rounded-md shadow-lg overflow-hidden">
              <nav className="flex flex-col">

                {/* Historial */}
                <NavLink 
                  to="/calculator/history" 
                  className={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FiClock className="mr-3" /> <span>Historial</span>
                </NavLink>

                {/* Interés Simple */}
                <NavLink 
                  to="/calculator/simple-interest" 
                  className={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FiBarChart2 className="mr-3" /> <span>Interés Simple</span>
                </NavLink>

                {/* Interés Compuesto */}
                <NavLink 
                  to="/calculator/compound-interest" 
                  className={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FiTrendingUp className="mr-3" /> <span>Interés Compuesto</span>
                </NavLink>

                {/* Pago de Préstamo */}
                <NavLink 
                  to="/calculator/loan-payment" 
                  className={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FiFileText className="mr-3" /> <span>Pago de Préstamo</span>
                </NavLink>

                {/* Anualidad */}
                <NavLink 
                  to="/calculator/fv-annuity" 
                  className={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FiRepeat className="mr-3" /> <span>Anualidad</span>
                </NavLink>

              </nav>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
