// Variables de entorno para el entorno de pruebas.
// Este archivo se carga ANTES de cada suite via setupFiles en package.json.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = '142e9d3870d288ba5e523ee117e9f3396500675d31c3979dc38aaa8acad2557d';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '27017';
process.env.DB_NAME = 'calculadora_test';
process.env.NODE_PORT = '5001';
