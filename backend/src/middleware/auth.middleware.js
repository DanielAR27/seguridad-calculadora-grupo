const jwt = require('jsonwebtoken');

/**
 * Verifica el token JWT desde la cookie HttpOnly.
 * MITIGACIÓN REQ-SEG-LMC-03: El token se lee desde req.cookies (inaccesible a JS del cliente).
 */
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    const verifiedPayload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifiedPayload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido.' });
  }
};

module.exports = {
  verifyToken,
};
