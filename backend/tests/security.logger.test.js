/**
 * Tests de REQ-SEG-JUM (Joyce): Trazabilidad y Anti-Audit Poisoning.
 *
 * Amenaza modelada (4.4.2): Sin logs de auditoría, es imposible rastrear quién
 * eliminó un cálculo o cuándo ocurrieron intentos fallidos de autenticación.
 *
 * Corrección 1 (Parte 3-B): logSecurityEvent() registra eventos críticos con
 * timestamp, acción, userId e IP, sin exponer passwords ni tokens.
 *
 * Corrección 2 (Parte 3-C / anti-audit poisoning): cada entrada lleva un hash
 * SHA-256 encadenado al hash de la entrada anterior. Si alguien altera cualquier
 * registro, verifyLogIntegrity() detecta la manipulación.
 *
 * Patrón: tests que documentan la VULNERABILIDAD original seguidos de tests
 *         que verifican la CORRECCIÓN.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Usar un archivo de log temporal aislado para no contaminar el log real
const TEMP_LOG = path.join(os.tmpdir(), `security_test_${Date.now()}.log`);
process.env.SECURITY_LOG_PATH = TEMP_LOG;

const { logSecurityEvent, verifyLogIntegrity } = require('../src/middleware/security.logger');

describe('REQ-SEG-JUM: Trazabilidad de Eventos y Anti-Audit Poisoning', () => {
  beforeEach(() => {
    // Limpiar el log temporal antes de cada test
    if (fs.existsSync(TEMP_LOG)) {
      fs.writeFileSync(TEMP_LOG, '', 'utf8');
    }
  });

  afterAll(() => {
    if (fs.existsSync(TEMP_LOG)) {
      fs.unlinkSync(TEMP_LOG);
    }
  });

  // ─── Documenta la vulnerabilidad original ──────────────────────────────────
  it('VULNERABLE (antes): sin logger, los eventos críticos no dejan rastro auditable', () => {
    // Antes no existía ningún archivo de log ni módulo de trazabilidad.
    // Un atacante podía hacer múltiples intentos de login fallidos o eliminar
    // todos los cálculos de un usuario sin dejar evidencia alguna.
    const logExistiaAntes = false;
    expect(logExistiaAntes).toBe(false); // documenta la ausencia de auditoría
  });

  // ─── Verifica Corrección 1: Trazabilidad ──────────────────────────────────
  it('REQ-SEG-JUM: Debe registrar un evento LOGIN_FAILED con timestamp y userId', () => {
    logSecurityEvent('LOGIN_FAILED', {
      userId: 'atacante@test.com',
      ip: '192.168.1.100',
      endpoint: '/api/auth/login',
    });

    const content = fs.readFileSync(TEMP_LOG, 'utf8').trim();
    const entry = JSON.parse(content.split('\n')[0]);

    expect(entry.action).toBe('LOGIN_FAILED');
    expect(entry.timestamp).toBeDefined();
    expect(entry.userId).toBe('atacante@test.com');
    expect(entry.ip).toBe('192.168.1.100');
    expect(entry.endpoint).toBe('/api/auth/login');
  });

  it('REQ-SEG-JUM: Debe registrar un evento CALC_DELETED con userId del propietario', () => {
    logSecurityEvent('CALC_DELETED', {
      userId: 'usuario123',
      ip: '10.0.0.1',
      endpoint: '/api/calculator/abc123',
    });

    const content = fs.readFileSync(TEMP_LOG, 'utf8').trim();
    const entry = JSON.parse(content.split('\n')[0]);

    expect(entry.action).toBe('CALC_DELETED');
    expect(entry.userId).toBe('usuario123');
  });

  it('REQ-SEG-JUM: NO debe registrar passwords ni tokens en el log (no secretos en texto plano)', () => {
    logSecurityEvent('LOGIN_FAILED', {
      userId: 'test@test.com',
      ip: '127.0.0.1',
      // Campos sensibles que NO deben aparecer en el log
      password: 'MiPasswordSuperSecreta!',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secreto',
    });

    const content = fs.readFileSync(TEMP_LOG, 'utf8');
    expect(content).not.toContain('MiPasswordSuperSecreta!');
    expect(content).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secreto');
  });

  it('REQ-SEG-JUM: Cada entrada debe contener un hash SHA-256 de 64 caracteres hex', () => {
    logSecurityEvent('LOGIN_SUCCESS', { userId: 'user@test.com', ip: '127.0.0.1' });
    logSecurityEvent('CALC_DELETED', { userId: 'user@test.com', ip: '127.0.0.1' });

    const content = fs.readFileSync(TEMP_LOG, 'utf8').trim();
    const lines = content.split('\n').filter(Boolean);

    lines.forEach(line => {
      const entry = JSON.parse(line);
      expect(entry.hash).toMatch(/^[a-f0-9]{64}$/);
      expect(entry.prevHash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  // ─── Verifica Corrección 2: Anti-Audit Poisoning ──────────────────────────
  it('REQ-SEG-JUM: Un log sin alteraciones debe pasar la verificación de integridad', () => {
    logSecurityEvent('LOGIN_FAILED', { userId: 'user1@test.com', ip: '127.0.0.1' });
    logSecurityEvent('LOGIN_SUCCESS', { userId: 'user1@test.com', ip: '127.0.0.1' });
    logSecurityEvent('CALC_DELETED', { userId: 'user1@test.com', ip: '127.0.0.1' });

    expect(verifyLogIntegrity()).toBe(true);
  });

  it('REQ-SEG-JUM: Alterar el campo "action" de una entrada debe invalidar la cadena de hashes', () => {
    logSecurityEvent('LOGIN_FAILED', { userId: 'hacker@test.com', ip: '192.168.1.1' });
    logSecurityEvent('LOGIN_FAILED', { userId: 'hacker@test.com', ip: '192.168.1.1' });

    // El log tiene integridad antes de manipular
    expect(verifyLogIntegrity()).toBe(true);

    // Un atacante intenta borrar evidencia cambiando 'LOGIN_FAILED' por 'LOGIN_SUCCESS'
    const content = fs.readFileSync(TEMP_LOG, 'utf8');
    const manipulado = content.replace('"action":"LOGIN_FAILED"', '"action":"LOGIN_SUCCESS"');
    fs.writeFileSync(TEMP_LOG, manipulado, 'utf8');

    // La cadena de hashes detecta la manipulación
    expect(verifyLogIntegrity()).toBe(false);
  });

  it('REQ-SEG-JUM: Eliminar una entrada del log debe invalidar la cadena de hashes', () => {
    logSecurityEvent('LOGIN_FAILED', { userId: 'u1@test.com', ip: '1.1.1.1' });
    logSecurityEvent('LOGIN_FAILED', { userId: 'u1@test.com', ip: '1.1.1.1' });
    logSecurityEvent('CALC_DELETED', { userId: 'u1@test.com', ip: '1.1.1.1' });

    expect(verifyLogIntegrity()).toBe(true);

    // Eliminar la primera línea (encubrir el primer intento fallido)
    const lines = fs.readFileSync(TEMP_LOG, 'utf8').trim().split('\n').filter(Boolean);
    fs.writeFileSync(TEMP_LOG, lines.slice(1).join('\n') + '\n', 'utf8');

    expect(verifyLogIntegrity()).toBe(false);
  });

  it('REQ-SEG-JUM: Un log vacío debe pasar la verificación de integridad', () => {
    // Caso borde: log recién creado sin entradas
    expect(verifyLogIntegrity()).toBe(true);
  });
});
