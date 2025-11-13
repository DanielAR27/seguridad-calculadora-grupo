const authService = require('../services/auth.service');

/**
 * Controlador para registrar un nuevo usuario.
 * Delegamos toda la lógica de validación y guardado al authService.
 */
const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);

    // Respuesta segura: no devolvemos datos sensibles del usuario.
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      userId: user._id,
    });
  } catch (error) {
    // Error de validación o duplicado de email.
    res.status(400).json({ error: error.message });
  }
};

/**
 * Controlador para iniciar sesión.
 * authService.login devuelve { token, user } si las credenciales son válidas.
 */
const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.status(200).json(data);
  } catch (error) {
    // Credenciales incorrectas o usuario inexistente.
    res.status(401).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
};
