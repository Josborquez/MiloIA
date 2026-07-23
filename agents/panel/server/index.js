// index.js — servidor del panel. Fase 1: lectura. Fase 2: SSE en tiempo real.
import express from 'express';
import { getRegistry, getStatus, getMessages, getLog, isValidAgent } from './fsReader.js';
import { createWatcher } from './watcher.js';

const app = express();
const HOST = '127.0.0.1'; // solo localhost, sin exposición a red
const PORT = process.env.PORT || 4321;

// --- SSE ---
const sseClients = new Set();

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) client.write(payload);
}

app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('retry: 2000\n\n'); // el EventSource del cliente reconecta a los 2s
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

// Heartbeat para mantener vivas las conexiones SSE.
setInterval(() => {
  for (const client of sseClients) client.write(': ping\n\n');
}, 30_000).unref();

app.get('/api/registry', async (req, res) => {
  try {
    res.json(await getRegistry());
  } catch {
    res.status(500).json({ error: 'registry.json ausente o corrupto' });
  }
});

app.get('/api/status', async (req, res) => {
  res.json(await getStatus()); // tolerante a fallos internamente
});

// Valida :name contra registry.json antes de tocar el filesystem.
app.use('/api/agents/:name', async (req, res, next) => {
  if (!(await isValidAgent(req.params.name))) {
    return res.status(404).json({ error: `agente desconocido: ${req.params.name}` });
  }
  next();
});

app.get('/api/agents/:name/inbox', async (req, res) => {
  res.json(await getMessages(req.params.name, 'inbox'));
});

app.get('/api/agents/:name/outbox', async (req, res) => {
  res.json(await getMessages(req.params.name, 'outbox'));
});

app.get('/api/agents/:name/logs', async (req, res) => {
  try {
    res.json(await getLog(req.params.name, req.query.date));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

await createWatcher(broadcast);

app.listen(PORT, HOST, () => {
  console.log(`Panel de agentes escuchando en http://${HOST}:${PORT}`);
});
