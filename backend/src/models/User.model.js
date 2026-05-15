const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Esquema de usuarios para autenticación básica
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      validate: {
        validator: function (v) {
          // MITIGACIÓN REQ-SEG-LMC-02: mínimo 8 chars, mayúscula, número y carácter especial
          return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>/?]).{8,}$/.test(v);
        },
        message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.',
      },
    },

    // Campo simple para roles (acceso normal o administrativo)
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true, // createdAt y updatedAt automáticos
  }
);

// Middleware: hashear contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para validar contraseñas durante el login
userSchema.methods.comparePassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
