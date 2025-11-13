# Calculadora Financiera

Una aplicación web completa para realizar cálculos financieros con autenticación de usuarios, historial de consultas y persistencia de datos.

## Características

### Frontend
- **Autenticación**: Login y registro de usuarios
- **Historial**: Visualización, consulta y eliminación de cálculos guardados
- **Tipos de Cálculo**:
  - Interés Simple
  - Interés Compuesto  
  - Pago de Préstamo (Amortización)
  - Valor Futuro de Anualidad
- **Funcionalidades**: Cada cálculo se puede realizar sin guardar o guardar en el historial para consulta posterior
- **Exportación**: Descarga de resultados en formato CSV

### Backend
- **Autenticación**: Sistema JWT para manejo de sesiones
- **Controladores**: Separación entre cálculo y guardado mediante parámetros de consulta
- **Validaciones**: Verificación de datos de entrada en cada endpoint
- **Base de Datos**: MongoDB para persistencia de usuarios y cálculos

## Arquitectura

Solo la base de datos está contenerizada con Docker. El frontend y backend se ejecutan localmente para facilitar el desarrollo.

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Frontend | 5173   | Aplicación React con Vite |
| Backend  | 5000   | API REST con Express.js |
| Mongo Express  | 8081  | Base de datos (Docker) |

## Instalación

### Prerrequisitos
- Node.js y npm instalados
- Docker Desktop ejecutándose
- Limpiar volúmenes de Docker si es necesario: `docker volume prune`

### Configuración

1. **Variables de entorno**:
```bash
   # Raíz del proyecto
   cp template.env .env
   
   # Backend
   cp backend/template.env backend/.env
   
   # Frontend  
   cp frontend/template.env frontend/.env
```

2. **Base de datos**:
```bash
   docker-compose up --build -d
```

3. **Backend**:
```bash
   cd backend/
   npm run dev
```

4. **Frontend** (en otra terminal):
```bash
   cd frontend/
   npm run dev
```

## Uso

1. Acceda a `http://localhost:5173`
2. Regístrese o inicie sesión
3. Seleccione el tipo de cálculo deseado
4. Introduzca los datos y calcule
5. Opcionalmente guarde el resultado en su historial
6. Consulte sus cálculos guardados desde el historial

## Tecnologías

- **Frontend**: React, React Router, Tailwind CSS, Axios, Chart.js
- **Backend**: Express.js, Mongoose, JWT, bcrypt
- **Base de Datos**: MongoDB + Mongo Express
- **Containerización**: Docker Compose