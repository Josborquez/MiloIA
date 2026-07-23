// fsReader.js — lectura pura del filesystem de agents/. Nunca escribe.
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// agents/panel/server → agents/
export const AGENTS_ROOT = path.resolve(__dirname, '..', '..');

const ALERTS_TAIL_LINES = 50;

/** Valida que un nombre de agente exista en registry.json y no contenga rutas. */
export async function isValidAgent(name) {
  if (typeof name !== 'string' || !/^[a-z0-9-]+$/.test(name)) return false;
  const registry = await getRegistry();
  return registry.agents.some((a) => a.name === name);
}

/** Contenido de registry.json. Lanza si no existe o está corrupto. */
export async function getRegistry() {
  const raw = await fs.readFile(path.join(AGENTS_ROOT, 'registry.json'), 'utf8');
  return JSON.parse(raw);
}

/** last-status.json + últimas líneas de alerts.log. Tolerante a fallos. */
export async function getStatus() {
  let status = { timestamp: null, agents: {}, estado: 'desconocido' };
  try {
    const raw = await fs.readFile(
      path.join(AGENTS_ROOT, 'dashboard', 'last-status.json'),
      'utf8'
    );
    status = { ...JSON.parse(raw), estado: 'ok' };
  } catch {
    // ausente o corrupto → estado "desconocido", no tumbar el servidor
  }

  let alerts = [];
  try {
    const raw = await fs.readFile(
      path.join(AGENTS_ROOT, 'dashboard', 'alerts.log'),
      'utf8'
    );
    alerts = raw.split(/\r?\n/).filter(Boolean).slice(-ALERTS_TAIL_LINES);
  } catch {
    // sin alerts.log → lista vacía
  }

  return { ...status, alerts };
}

/** Parsea frontmatter YAML simple (clave: valor) de un mensaje .md. */
function parseMessage(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw.trim() };
  const frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx > 0) frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { frontmatter, body: match[2].trim() };
}

/** Lista y contenido de mensajes de inbox/ u outbox/ de un agente. */
export async function getMessages(agent, box) {
  if (box !== 'inbox' && box !== 'outbox') throw new Error(`box inválido: ${box}`);
  const dir = path.join(AGENTS_ROOT, agent, box);

  let entries = [];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return []; // carpeta ausente → lista vacía
  }

  const files = entries.filter((f) => f.endsWith('.md') || f.endsWith('.json'));
  const messages = [];
  for (const file of files.sort()) {
    try {
      const raw = await fs.readFile(path.join(dir, file), 'utf8');
      if (file.endsWith('.json')) {
        messages.push({ file, frontmatter: {}, body: raw.trim() });
      } else {
        messages.push({ file, ...parseMessage(raw) });
      }
    } catch {
      messages.push({ file, frontmatter: {}, body: null, error: 'no se pudo leer' });
    }
  }
  return messages;
}

/** Log del día (YYYY-MM-DD) de un agente. Default: hoy. */
export async function getLog(agent, date) {
  const day = date || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error(`fecha inválida: ${day}`);
  try {
    const raw = await fs.readFile(
      path.join(AGENTS_ROOT, agent, 'logs', `${day}.log`),
      'utf8'
    );
    return { date: day, lines: raw.split(/\r?\n/).filter(Boolean) };
  } catch {
    return { date: day, lines: [] }; // agente sin logs del día
  }
}
