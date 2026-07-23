import React, { useEffect, useState } from 'react';
import { getJSON } from '../api.js';

/**
 * Operaciones pendientes de aprobación. Aprobar/Rechazar escribe un
 * mensaje en router/inbox/ (nunca ejecuta la acción directamente).
 */
export default function ApprovalsPanel({ outboxVersion }) {
  const [pending, setPending] = useState([]);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const refresh = () => {
    getJSON('/api/pending').then(setPending).catch(() => {});
  };

  useEffect(refresh, [outboxVersion]);

  const act = async (item, action) => {
    setBusy(item.id);
    setError(null);
    try {
      const res = await fetch(
        `/api/pending/${encodeURIComponent(item.id)}/${action}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario: 'panel' }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.status);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  if (pending.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-900 bg-amber-950/20 p-4">
      <h2 className="font-semibold mb-3 text-amber-300">
        Aprobaciones pendientes ({pending.length})
      </h2>
      {error && <p className="text-sm text-red-400 mb-2">Error: {error}</p>}
      <ul className="space-y-3">
        {pending.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-amber-400">{item.id}</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {item.agent}
              </span>
            </div>
            <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans mb-3">
              {item.body}
            </pre>
            <div className="flex gap-2">
              <button
                onClick={() => act(item, 'approve')}
                disabled={busy === item.id}
                className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 rounded px-3 py-1 text-sm font-medium"
              >
                Aprobar
              </button>
              <button
                onClick={() => act(item, 'reject')}
                disabled={busy === item.id}
                className="bg-red-800 hover:bg-red-700 disabled:opacity-40 rounded px-3 py-1 text-sm font-medium"
              >
                Rechazar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
