/**
 * MITIGACIÓN REQ-SEG-JUM (Joyce):
 * Logger de eventos de seguridad con integridad anti-audit-poisoning.
 *
 * Mecanismo: cada entrada incluye el hash SHA-256 de la entrada anterior
 * (hash chaining). Si alguien modifica cualquier registro pasado, todos los
 * hashes posteriores quedan inválidos, haciendo detectable la alteración.
 *
 * El archivo se abre siempre en modo append ('a'), nunca se sobreescribe.
 * No se registran passwords ni tokens en texto plano.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const LOG_FILE = process.env.SECURITY_LOG_PATH ||
  path.join(__dirname, '../../logs/security.log');

const LOGS_DIR = path.dirname(LOG_FILE);

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const GENESIS_HASH = '0'.repeat(64);

function getLastHash() {
  try {
    const content = fs.readFileSync(LOG_FILE, 'utf8').trim();
    if (!content) return GENESIS_HASH;
    const lines = content.split('\n').filter(Boolean);
    const last = JSON.parse(lines[lines.length - 1]);
    return last.hash || GENESIS_HASH;
  } catch {
    return GENESIS_HASH;
  }
}

function computeHash(prevHash, entryData) {
  return crypto
    .createHash('sha256')
    .update(prevHash + JSON.stringify(entryData))
    .digest('hex');
}

/**
 * Registra un evento de seguridad de forma append-only con hash encadenado.
 * @param {string} action  Nombre del evento (ej. 'LOGIN_FAILED', 'CALC_DELETED')
 * @param {object} context Contexto: userId, ip, endpoint. NUNCA incluir passwords/tokens.
 */
function logSecurityEvent(action, context = {}) {
  const entryData = {
    timestamp: new Date().toISOString(),
    action,
    userId: context.userId || 'anonymous',
    ip: context.ip || 'unknown',
    endpoint: context.endpoint || '',
  };

  const prevHash = getLastHash();
  const hash = computeHash(prevHash, entryData);

  const logLine = JSON.stringify({ ...entryData, prevHash, hash }) + '\n';

  fs.appendFileSync(LOG_FILE, logLine, 'utf8');
}

/**
 * Verifica la integridad de toda la cadena de hashes del log.
 * Retorna true si ninguna entrada fue alterada, false si detecta manipulación.
 */
function verifyLogIntegrity() {
  try {
    const content = fs.readFileSync(LOG_FILE, 'utf8').trim();
    if (!content) return true;

    const lines = content.split('\n').filter(Boolean);
    let expectedPrevHash = GENESIS_HASH;

    for (const line of lines) {
      const { prevHash, hash, ...entryData } = JSON.parse(line);

      if (prevHash !== expectedPrevHash) return false;

      const expectedHash = computeHash(prevHash, entryData);
      if (hash !== expectedHash) return false;

      expectedPrevHash = hash;
    }

    return true;
  } catch {
    return false;
  }
}

module.exports = { logSecurityEvent, verifyLogIntegrity };
