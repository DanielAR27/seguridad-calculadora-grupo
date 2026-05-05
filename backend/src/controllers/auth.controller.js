const authService = require('../services/auth.service');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000,
};

/**
 * Registra un nuevo usuario en la base de datos.
 */
const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      userId: user._id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Autentica credenciales y establece la sesión mediante cookie HttpOnly.
 * MITIGACIÓN REQ-SEG-LMC-03: El JWT nunca viaja en el body — se entrega como cookie HttpOnly.
 */
const login = async (req, res) => {
  try {
    const { token, user } = await authService.login(req.body);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

/**
 * Cierra la sesión eliminando la cookie de autenticación.
 */
const logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
  res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
};

/**
 * Devuelve los datos del usuario autenticado leyendo el payload del JWT en la cookie.
 */
const me = (req, res) => {
  const { userId, email, role } = req.user;
  res.status(200).json({ user: { id: userId, email, role } });
};

module.exports = {
  register,
  login,
  logout,
  me,
};
