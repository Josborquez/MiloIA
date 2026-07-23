// messageWriter.js — ÚNICA función del panel que escribe en el filesystem.
// Destino permitido: exclusivamente agents/router/inbox/ (protocolo del ecosistema).
import fs from 'fs/promises';
import path from 'path';
import { AGENTS_ROOT } from './fsReader.js';

const ROUTER_INBOX = path.join(AGENTS_ROOT, 'router', 'inbox');

/** Quita saltos de línea y '---' para impedir inyección de frontmatter. */
function sanitizeField(value) {
  return String(value ?? '').replace(/\r?\n/g, ' ').replace(/---/g, '').trim();
}

/**
 * Escribe un mensaje en router/inbox/ con nombre YYYYMMDDTHHMMSS-panel.md.
 * Escritura atómica: write a .tmp + rename. Devuelve { file }.
 */
export async function writeRouterMessage({ usuario, tema, texto }) {
  if (typeof texto !== 'string' || !texto.trim()) {
    throw Object.assign(new Error('texto requerido'), { status: 400 });
  }
  if (texto.length > 10_000) {
    throw Object.assign(new Error('texto demasiado largo (máx 10000)'), { status: 400 });
  }

  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').slice(0, 15); // YYYYMMDDTHHMMSS

  // Nombre fijo generado aquí (nunca del cliente) + sufijo anti-colisión.
  let filename = `${stamp}-panel.md`;
  let dest = path.resolve(ROUTER_INBOX, filename);
  for (let i = 1; await exists(dest); i++) {
    filename = `${stamp}-panel-${i}.md`;
    dest = path.resolve(ROUTER_INBOX, filename);
  }

  // Defensa en profundidad: el destino debe quedar dentro de router/inbox/.
  if (!dest.startsWith(ROUTER_INBOX + path.sep)) {
    throw Object.assign(new Error('destino fuera de router/inbox'), { status: 400 });
  }

  const lines = [
    '---',
    'origen: panel',
    `usuario: ${sanitizeField(usuario) || 'panel'}`,
    `timestamp: ${now.toISOString()}`,
  ];
  const temaLimpio = sanitizeField(tema);
  if (temaLimpio) lines.push(`tema-hint: ${temaLimpio}`); // solo hint; el dispatch lo decide el router
  lines.push('---', '', texto.trim(), '');

  const tmp = dest + '.tmp';
  await fs.writeFile(tmp, lines.join('\n'), 'utf8');
  await fs.rename(tmp, dest);

  return { file: filename };
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
