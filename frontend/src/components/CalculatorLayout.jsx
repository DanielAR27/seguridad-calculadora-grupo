import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Barra superior de navegación

function CalculatorLayout() {
  return (
    // Contenedor general de todas las páginas dentro del área de "calculator"
    <div className="min-h-screen bg-gray-100">

      {/* 
        Sección principal.
        La estructura se mantiene flexible para que cada página hija herede el espacio,
        mientras que el navbar permanece fijo en la parte superior.
      */}
      <div className="flex-1 flex flex-col">

        {/* 
          Navbar superior.
          Incluye el menú desplegable y el botón de cerrar sesión.
          Se renderiza en cada vista de la calculadora.
        */}
        <Navbar />

        {/* 
          Área de contenido.
          Aquí React Router inyecta la vista correspondiente según la ruta interna.
          Cada calculadora o página de historial se mostrará dentro de este espacio.
        */}
        <main className="flex-1 p-8">
          <Outlet /> {/* Render dinámico de la página hija */}
        </main>

      </div>

      {/* 
        Nota:
        El <aside> original y el overlay se removieron correctamente.
        Este layout está optimizado para una estructura simple y centrada.
      */}

    </div>
  );
}

export default CalculatorLayout;