// api.js — fetch + EventSource (SSE) contra el backend del panel.

export async function getJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

/**
 * Se suscribe al stream SSE. handlers = { 'status-changed': fn, ... }.
 * EventSource reconecta solo (retry: 2000 enviado por el servidor).
 * Devuelve función de cleanup.
 */
export function subscribe(handlers, onConnectionChange) {
  const es = new EventSource('/api/events');
  for (const [event, fn] of Object.entries(handlers)) {
    es.addEventListener(event, (e) => fn(JSON.parse(e.data)));
  }
  if (onConnectionChange) {
    es.onopen = () => onConnectionChange(true);
    es.onerror = () => onConnectionChange(false);
  }
  return () => es.close();
}
