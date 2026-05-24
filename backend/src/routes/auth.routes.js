const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const authRateLimiter = require('../middleware/authRateLimit.middleware');

// POST /api/auth/register
router.post('/register', authRateLimiter, authController.register);

// POST /api/auth/login
router.post('/login', authRateLimiter, authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/me â€” verifica sesiÃ³n activa y devuelve datos del usuario
router.get('/me', verifyToken, authController.me);

module.exports = router;