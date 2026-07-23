// index.js — servidor del panel. Fase 1: solo endpoints de lectura.
import express from 'express';
import { getRegistry, getStatus, getMessages, getLog, isValidAgent } from './fsReader.js';

const app = express();
const HOST = '127.0.0.1'; // solo localhost, sin exposición a red
const PORT = process.env.PORT || 4321;

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

app.listen(PORT, HOST, () => {
  console.log(`Panel de agentes (Fase 1) escuchando en http://${HOST}:${PORT}`);
});
