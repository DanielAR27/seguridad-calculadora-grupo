const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

/**
 * Registra un nuevo usuario en la base de datos.
 * - Verifica duplicado de email
 * - El hashing de contraseña lo realiza el modelo (hook pre-save)
 */
const register = async (userData) => {
  // MITIGACIÓN REQ-SEG-01: Desestructuración estricta (Allowlist). 
  // Se ignora el 'role' o cualquier otro campo inyectado por el cliente.
  const { email, password } = userData;

  // Validación: evitar emails repetidos
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('El email ya está en uso');
  }

  // Creación del usuario ÚNICAMENTE con los campos permitidos
  // Mongoose aplicará automáticamente role: 'user' gracias al default del esquema
  const user = new User({
    email,
    password,
  });

  await user.save();
  return user;
};

/**
 * Autentica credenciales y genera un token JWT.
 * Devuelve: { token, user:{id,email,role} }
 */
const login = async (credentials) => {
  const { email, password } = credentials;

  // Verificar si el usuario existe
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  // Validar contraseña usando el método del modelo
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  // Payload básico para el JWT
  const payload = {
    userId: user._id,
    role: user.role,
  };

  // Firma del token con expiración estándar
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  // Retornar token y datos públicos del usuario
  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = {
  register,
  login,
};
