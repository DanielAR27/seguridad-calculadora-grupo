const jwt = require('jsonwebtoken');

/**
 * Verifica el token JWT de la cabecera Authorization.
 * Si es válido, adjunta el payload del token (user) a req.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Formato esperado: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // 401 Unauthorized: No se proporcionó token
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    // Verifica el token usando el secreto
    const verifiedPayload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adjunta el payload (ej: { userId, role }) al objeto request
    req.user = verifiedPayload;
    
    // Pasa al siguiente middleware o controlador
    next();
  } catch (error) {
    // 401 Unauthorized: Token inválido o expirado
    res.status(401).json({ error: 'Token inválido.' });
  }
};

module.exports = {
  verifyToken,
};