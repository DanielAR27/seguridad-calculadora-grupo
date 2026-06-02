# Calculadora Financiera — Guía de Reproducción de Vulnerabilidades y Correcciones

**Curso:** IC-8071 Seguridad del Software — I Semestre 2026  
**Equipo:** Daniel Alemán Ruiz · Kristhel Guido Ramos · Luis Meza Chavarría · Joyce Ugalde Miranda  
**Repositorio:** [Link de Github](https://github.com/DanielAR27/seguridad-calculadora-grupo)

---
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


```bash
cp template.env .env # Copiar el .env en la raíz del programa
cp backend/template.env backend/.env # Copiar el .env para el backend
cp frontend/template.env frontend/.env #Copiar el .env para el frontend
docker-compose up --build -d # Inicializar la DB
```

### Ejecución

```bash
cd backend/
npm run dev # Ejecutar en la terminal 1
cd frontend/
npm run dev # Ejecutar en la terminal 2
```

---
# Ejecución de Pruebas Automatizadas
```bash
   # Pruebas del backend
   cd backend
   npm run test

   # Pruebas del frontend
   cd frontend
   npm run test
```
# Aportes Individuales

## Sección de Daniel Alemán Ruiz

Ramas: `dar-correciones-backend` · `dar-correciones-frontend` · `dar-correciones-backend-v2`

### Backend 1: Prevención de Asignación Masiva en Registro

- **Vulnerabilidad:** El controlador `register` guardaba el `req.body` completo, permitiendo inyectar `"role": "admin"`.

- **Corrección:** Se implementó desestructuración estricta en `auth.service.js` extrayendo solo `email` y `password`.

- **Prueba:** `npm test -- --testPathPattern=auth.security` en la prueba `REQ-SEG-01`. (Verifica que el rol inyectado sea ignorado).

### Backend 2: Saneamiento Estricto de Entradas en el Historial

- **Vulnerabilidad:** Se guardaban parámetros arbitrarios o scripts en la base de datos al calcular intereses.

- **Corrección:** En `calculator.controller.js`, se crea un objeto `cleanInputs` que mapea explícitamente solo los atributos matemáticos esperados.

- **Prueba:** `npm test -- --testPathPattern=calculator.security` en la prueba `REQ-SEG-03`. (Asegura que los campos inyectados queden en `undefined`).

### Backend 3: Fortalecimiento del Secreto JWT (Fail-Safe)

- **Vulnerabilidad:** El servidor arrancaba con secretos débiles o inexistentes.

- **Corrección:** Se generó una clave de 256 bits y se añadió una validación en `server.js` que apaga la aplicación (`process.exit(1)`) si `JWT_SECRET` no está definida.

- **Prueba:** Eliminar la variable del .env y correr npm run dev (el proceso debe abortar con un error fatal).

### Frontend 1: Validación Visual de Contraseñas

- **Vulnerabilidad:** Formularios permitían enviar peticiones HTTP con contraseñas débil

- **Corrección:** Se implementó `evaluatePasswordStrength` en `RegisterPage.jsx` para deshabilitar el botón de envío hasta cumplir con criterios de complejidad.

- **Prueba:** `npm run test:security` en la prueba `REQ-SEG-05`.

## Sección de Kristhel Guido Ramos

Ramas: kgr-correcciones-seguridad

### Backend 1: Rate Limiting en Autenticación

- **Vulnerabilidad:** Las rutas de autenticación `/api/auth/login` y `/api/auth/register` permitían múltiples intentos consecutivos sin aplicar un límite por dirección IP. Esto exponía el sistema a ataques de fuerza bruta contra credenciales y a posibles abusos de disponibilidad mediante solicitudes repetidas.

- **Corrección:** Se implementó `express-rate-limit` mediante el middleware `authRateLimiter` en `backend/src/middleware/authRateLimit.middleware.js`. Este middleware limita a 5 solicitudes por IP dentro de una ventana de 15 minutos y fue aplicado directamente sobre las rutas de registro e inicio de sesión en `backend/src/routes/auth.routes.js`.

- **Prueba:** Se ejecutaron intentos consecutivos contra `/api/auth/login`. Antes de la corrección, el sistema respondía `HTTP 401` en los intentos fallidos sin bloquear la frecuencia de solicitudes. Después de la corrección, el exceso de intentos es bloqueado y la interfaz muestra un mensaje controlado indicando: “Demasiados intentos de autenticación. Intente nuevamente más tarde.”

### Backend 2: Middleware Global de Manejo de Errores

- **Vulnerabilidad:** El backend exponía detalles técnicos internos ante solicitudes inválidas, incluyendo mensajes como `SyntaxError`, referencias a `body-parser`, stack traces y rutas locales del proyecto. Esto podía revelar información útil para un atacante sobre la estructura y tecnologías internas de la aplicación.

- **Corrección:** Se implementó un middleware global de manejo de errores en `backend/src/middleware/error.middleware.js`. Este middleware registra internamente información mínima para depuración y devuelve al cliente una respuesta JSON genérica, evitando la exposición de detalles internos. La corrección fue integrada en `backend/server.js` después del registro de las rutas principales.

- **Prueba:** Se envió una solicitud con JSON mal formado hacia `/api/auth/login`. Antes de la corrección, el servidor devolvía una respuesta HTML con detalles técnicos internos. Después de la corrección, responde con `HTTP 400 Bad Request` y el mensaje genérico `{"error":"Error interno del servidor"}`.

### Frontend 1: Saneamiento en Vista de Historial

- **Vulnerabilidad:** La vista `HistoryPage.jsx` renderizaba valores provenientes del historial de cálculos sin una función explícita de saneamiento o normalización. En particular, la función `formatType` podía devolver directamente valores desconocidos mediante `default: return type`, lo que representaba un riesgo preventivo frente a escenarios de Cross-Site Scripting almacenado si llegaban datos manipulados desde la base de datos.

- **Corrección:** Se agregaron funciones auxiliares de saneamiento y normalización en `frontend/src/pages/HistoryPage.jsx`. La función `escapeText` escapa caracteres especiales en valores dinámicos, `safeCurrency` valida resultados numéricos antes de renderizarlos y `encodeURIComponent` protege la construcción de rutas internas con identificadores provenientes del historial.

- **Prueba:** Se verificó el código corregido para confirmar el uso de `escapeText`, `safeCurrency` y `encodeURIComponent`. Además, se comprobó desde la interfaz que la vista de historial continúa cargando correctamente los cálculos guardados después de aplicar el saneamiento.

## Sección de Luis Meza Chavarría

Ramas: `luis`

### Backend 1: Validación de ObjectId

- **Vulnerabilidad:** Peticiones con IDs alterados (p.ej. `"id_invalido_$$"`) provocaban un `CastError` de Mongoose no controlado, resultando en una respuesta 500 o comportamiento impredecible susceptible a inyecciones NoSQL.

- **Corrección:** Se añadió `mongoose.Types.ObjectId.isValid(req.params.id)` al inicio de `getCalculationById` y `deleteCalculation` en `calculator.controller.js`. Si el ID no es un ObjectId válido, el controlador retorna 400 inmediatamente sin consultar la base de datos.

- **Prueba:** `npm test -- --testPathPattern=objectid.security` en las pruebas `REQ-SEG-LMC-01`. Verifica que IDs malformados devuelvan 400 y que ObjectIds válidos pero inexistentes devuelvan 404.

### Backend 2: Expresión Regular (Regex) para Contraseñas

- **Vulnerabilidad:** El campo `password` en `User.model.js` solo exigía `minlength: 6`, permitiendo registrar usuarios con contraseñas como `"abc123"` desde la capa de persistencia, independientemente de las validaciones del frontend.

- **Corrección:** Se reemplazó `minlength` por una validación Regex en `User.model.js` que exige: mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial (`^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*...]).{8,}$`). La validación ocurre antes del hook `pre-save` de bcrypt.

- **Prueba:** `npm test -- --testPathPattern=password.security` en las pruebas `REQ-SEG-LMC-02`. Verifica el rechazo de contraseñas sin mayúscula, sin número y con menos de 8 caracteres, y la aceptación de `"Segura123!"`.

### Frontend 1: Sesiones con Cookies HttpOnly (Refactorización de Auth)

- **Vulnerabilidad:** El token JWT se almacenaba en `localStorage`, accesible a cualquier script de la página. Un ataque XSS exitoso podía leer y exfiltrar el token completo.

- **Corrección:** Refactorización completa del flujo de autenticación: el backend establece el JWT en una cookie `HttpOnly` mediante `res.cookie()` en `auth.controller.js`, por lo que el token nunca viaja en el body ni es accesible desde JavaScript. `AuthContext.jsx` elimina toda referencia a `localStorage` y verifica la sesión activa mediante `GET /api/auth/me`. Axios usa `withCredentials: true`. Se añadieron los endpoints `POST /api/auth/logout` y `GET /api/auth/me`.

- **Prueba:** `npm test -- --testPathPattern=cookies.security` en las pruebas `REQ-SEG-LMC-03`. Verifica que la cookie lleve el flag `HttpOnly`, que el token no aparezca en el body del login, que rutas protegidas funcionen con cookie y rechacen peticiones sin ella, y que el logout elimine la cookie.

## Sección de Joyce Ugalde Miranda

Ramas: `JUM`

> [!NOTE]
> **Aclaración sobre herramientas de apoyo:** Durante el desarrollo de esta sección se utilizó a Claude únicamente como apoyo para la estructuración del código y depuración de pruebas. Debido a un error de configuración del entorno de desarrollo de Joyce al hacer commit (`29a4adb80a5c21a7e307fffb72759d11ee1ae96c`), se incluyó la firma `Co-Authored-By: Claude` en el mensaje de forma automática. Todo el código de esta sección fue verificado y estructurado por la estudiante.


### Backend 1: Reducción de Exposición de Sesión JWT

- **Vulnerabilidad:** Tokens JWT con ventana de exposición extensa (24 horas).

- **Corrección:**  Modificación de `jsonwebtoken.sign` en `auth.service.js` ajustando expiresIn a 15 minutos.

- **Prueba:** `Agregar prueba correspondiente.`

### Backend 2: Validación Estricta con Express-Validator

- **Vulnerabilidad:** Los cálculos matemáticos aceptaban valores no numéricos, provocando inconsistencias.

- **Corrección:**  Implementación de reglas de `express-validator` en `calculator.routes.js` rechazando tipos de datos inválidos en la capa de rutas.

- **Prueba:** `Agregar prueba correspondiente.`

### Frontend 1: Redirección por Expiración de Sesión

- **Vulnerabilidad:** La interfaz no reaccionaba a la expiración prematura del token, generando errores invisibles.

- **Corrección:**  Interceptor global en Axios que detecta el error 401 y redirige limpiamente a `LoginPage.jsx`.

- **Prueba:** `Agregar prueba correspondiente.`

## Corrección Compartida: Content Security Policy (CSP)

- **Vulnerabilidad:** La aplicación no declaraba políticas de seguridad de contenido (CWE-1021), lo que permitía al navegador cargar y ejecutar recursos o scripts desde cualquier dominio externo, abriendo la puerta a ataques XSS avanzados.

- **Corrección:** Se agregó una etiqueta `<meta http-equiv="Content-Security-Policy">` en el archivo `frontend/index.html` configurando un `default-src 'self'` y limitando estrictamente las conexiones (`connect-src`) al `localhost:5000`.

- **Prueba:** Abrir las DevTools (F12) en el navegador e intentar inyectar un script externo desde la consola usando: `const s = document.createElement('script'); s.src = 'https://example.com/malicioso.js'; document.head.appendChild(s);`. Se debe observar un error en consola indicando que el navegador bloqueó la carga del script por violar la directiva CSP.

Ninguna rama realiza push directo a `main`. Todos los cambios se integran
mediante Pull Request con descripción del cambio, vulnerabilidad corregida y riesgo mitigado.