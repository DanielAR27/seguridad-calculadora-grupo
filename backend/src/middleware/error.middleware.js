const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;

  console.error('[ERROR]', {
    message: err.message,
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });

  return res.status(statusCode).json({
    error: 'Error interno del servidor'
  });
};

module.exports = errorMiddleware;