import React, { useEffect, useState } from 'react';
import { getJSON } from '../api.js';

/**
 * Envía mensajes al ecosistema SIEMPRE vía router/inbox/ (POST /api/message)
 * y muestra la respuesta cuando aparece en router/outbox/.
 */
export default function MessageComposer({ agents, routerVersion }) {
  const [usuario, setUsuario] = useState('terry');
  const [tema, setTema] = useState('');
  const [texto, setTexto] = useState('');
  const [sending, setSending] = useState(false);
  const [sentAt, setSentAt] = useState(null);
  const [sentFile, setSentFile] = useState(null);
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState(null);

  const send = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setResponses([]);
    try {
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, tema: tema || undefined, texto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.status);
      setSentFile(data.file);
      setSentAt(data.file.slice(0, 15)); // YYYYMMDDTHHMMSS del nombre
      setTexto('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Cuando el router escribe en su outbox, buscar respuestas posteriores al envío.
  useEffect(() => {
    if (!sentAt) return;
    getJSON('/api/agents/router/outbox')
      .then((msgs) =>
        setResponses(msgs.filter((m) => m.file.slice(0, 15) >= sentAt))
      )
      .catch(() => {});
  }, [routerVersion, sentAt]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="font-semibold mb-3">Enviar mensaje (vía router)</h2>
      <form onSubmit={send} className="space-y-3">
        <div className="flex gap-3">
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Usuario"
            className="w-32 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm"
          />
          <select
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-300"
            title="Solo un hint; el dispatch real lo decide el router"
          >
            <option value="">tema (hint opcional)</option>
            {agents
              .filter((a) => !['router', 'dashboard'].includes(a.name))
              .map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
          </select>
        </div>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe tu mensaje…"
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={sending || !texto.trim()}
          className="bg-sky-700 hover:bg-sky-600 disabled:opacity-40 rounded px-4 py-1.5 text-sm font-medium"
        >
          {sending ? 'Enviando…' : 'Enviar'}
        </button>
      </form>

      {error && <p className="text-sm text-red-400 mt-2">Error: {error}</p>}
      {sentFile && (
        <p className="text-xs text-slate-500 mt-2 font-mono">
          Enviado: router/inbox/{sentFile}
        </p>
      )}
      {sentAt && responses.length === 0 && !error && (
        <p className="text-sm text-slate-400 mt-2 animate-pulse">
          Esperando respuesta en router/outbox…
        </p>
      )}
      {responses.map((m) => (
        <div
          key={m.file}
          className="mt-3 rounded-lg border border-emerald-900 bg-emerald-950/40 p-3"
        >
          <p className="text-xs font-mono text-emerald-400 mb-1">{m.file}</p>
          <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans">{m.body}</pre>
        </div>
      ))}
    </div>
  );
}
