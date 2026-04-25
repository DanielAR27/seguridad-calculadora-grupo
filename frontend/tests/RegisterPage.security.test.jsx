import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../src/pages/RegisterPage';
import '@testing-library/jest-dom'; 

// Mock del AuthContext para que el componente no explote al buscar la función register
vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    register: vi.fn(),
  }),
}));

describe('Pruebas de Seguridad - Interfaz de Registro', () => {
  it('REQ-SEG-05: Debe deshabilitar el botón de envío si la contraseña es débil', () => {
    // Renderizamos el componente dentro de un MemoryRouter
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Busca los elementos en el DOM virtual
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    // Simula la inyección de una contraseña débil (baja entropía)
    fireEvent.change(passwordInput, { target: { value: '123' } });

    // Verifica la seguridad: El botón DEBERÍA estar deshabilitado
    expect(submitButton).toBeDisabled();
  });
});