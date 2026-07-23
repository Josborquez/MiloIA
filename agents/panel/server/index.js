// index.js — servidor del panel. Fases: lectura, SSE, estáticos, escritura controlada.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRegistry, getStatus, getMessages, getLog, getPending, isValidAgent } from './fsReader.js';
import { createWatcher } from './watcher.js';
import { writeRouterMessage } from './messageWriter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

app.get('/api/pending', async (req, res) => {
  try {
    res.json(await getPending());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aprobación/rechazo: se materializa como mensaje en router/inbox/,
// NUNCA ejecutando la acción directamente.
app.post('/api/pending/:id/:action', express.json({ limit: '8kb' }), async (req, res) => {
  const { id, action } = req.params;
  if (action !== 'approve' && action !== 'reject') {
    return res.status(404).json({ error: `acción desconocida: ${action}` });
  }
  try {
    const item = (await getPending()).find((p) => p.id === id);
    if (!item) return res.status(404).json({ error: `operación pendiente no encontrada: ${id}` });

    const verbo = action === 'approve' ? 'APROBAR' : 'RECHAZAR';
    const result = await writeRouterMessage({
      usuario: req.body?.usuario,
      tema: item.agent,
      referencia: `${item.agent}/outbox/${item.file}`,
      texto: `${verbo} la operación pendiente ${item.id} del agente ${item.agent}.`,
    });
    res.status(201).json({ ...result, action, id });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Único endpoint de escritura: mensaje nuevo vía router/inbox/.
app.post('/api/message', express.json({ limit: '32kb' }), async (req, res) => {
  try {
    const { usuario, tema, texto } = req.body || {};
    // tema es solo un hint opcional; si viene, debe ser un agente del registry
    if (tema && !(await isValidAgent(tema))) {
      return res.status(400).json({ error: `tema-hint no es un agente válido: ${tema}` });
    }
    res.status(201).json(await writeRouterMessage({ usuario, tema, texto }));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Frontend compilado (npm run build → panel/dist)
app.use(express.static(path.resolve(__dirname, '..', 'dist')));

await createWatcher(broadcast);

app.listen(PORT, HOST, () => {
  console.log(`Panel de agentes escuchando en http://${HOST}:${PORT}`);
});
