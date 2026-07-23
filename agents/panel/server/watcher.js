// watcher.js — chokidar sobre agents/** → eventos para el stream SSE.
import path from 'path';
import chokidar from 'chokidar';
import { AGENTS_ROOT, getRegistry } from './fsReader.js';

/**
 * Observa inbox/, outbox/ y logs/ de cada agente del registry, más
 * dashboard/last-status.json y dashboard/alerts.log.
 * Llama onEvent(evento, data) con eventos:
 *   status-changed, new-inbox, new-outbox, new-alert, new-log
 */
export async function createWatcher(onEvent) {
  const registry = await getRegistry();

  const paths = [
    path.join(AGENTS_ROOT, 'dashboard', 'last-status.json'),
    path.join(AGENTS_ROOT, 'dashboard', 'alerts.log'),
  ];
  for (const { name } of registry.agents) {
    for (const box of ['inbox', 'outbox', 'logs']) {
      paths.push(path.join(AGENTS_ROOT, name, box));
    }
  }

  const watcher = chokidar.watch(paths, {
    ignoreInitial: true, // solo cambios nuevos, no el estado existente
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  });

  const classify = (filePath) => {
    const rel = path.relative(AGENTS_ROOT, filePath).split(path.sep);
    const [agent, dir, file] = rel;
    if (agent === 'dashboard' && rel[1] === 'last-status.json')
      return ['status-changed', { agent: 'dashboard' }];
    if (agent === 'dashboard' && rel[1] === 'alerts.log')
      return ['new-alert', { agent: 'dashboard' }];
    if (dir === 'inbox') return ['new-inbox', { agent, file }];
    if (dir === 'outbox') return ['new-outbox', { agent, file }];
    if (dir === 'logs') return ['new-log', { agent, file }];
    return [null, null];
  };

  const handle = (filePath) => {
    const [event, data] = classify(filePath);
    if (event) onEvent(event, { ...data, timestamp: new Date().toISOString() });
  };

  watcher.on('add', handle);
  watcher.on('change', handle);
  watcher.on('error', (err) => console.error('[watcher]', err.message));

  return watcher;
}
