const authService = require('../services/auth.service');
const { logSecurityEvent } = require('../middleware/security.logger');

// MITIGACIÓN REQ-SEG-11 (Joyce): maxAge sincronizado con expiresIn del token (15 min).
// La cookie expira al mismo tiempo que el JWT para evitar cookies huérfanas.
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000,
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

    // MITIGACIÓN REQ-SEG-JUM (Joyce): Registrar login exitoso para trazabilidad.
    logSecurityEvent('LOGIN_SUCCESS', {
      userId: user.email,
      ip: req.ip,
      endpoint: req.originalUrl,
    });

    res.status(200).json({ user });
  } catch (error) {
    // MITIGACIÓN REQ-SEG-JUM (Joyce): Registrar intento fallido sin exponer credenciales.
    logSecurityEvent('LOGIN_FAILED', {
      userId: req.body?.email || 'unknown',
      ip: req.ip,
      endpoint: req.originalUrl,
    });

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
