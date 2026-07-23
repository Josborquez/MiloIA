import React, { useEffect, useState, useRef } from 'react';
import { getJSON } from '../api.js';

const TABS = ['inbox', 'outbox', 'logs'];

function Message({ msg }) {
  const fm = Object.entries(msg.frontmatter || {});
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
      <p className="text-xs font-mono text-sky-400 mb-2">{msg.file}</p>
      {fm.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {fm.map(([k, v]) => (
            <span key={k} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              <span className="text-slate-500">{k}:</span> {v}
            </span>
          ))}
        </div>
      )}
      <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans">
        {msg.body ?? '(no se pudo leer)'}
      </pre>
    </div>
  );
}

export default function AgentDetail({ agent, version }) {
  const [tab, setTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [log, setLog] = useState({ date: '', lines: [] });
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    setError(null);
    if (tab === 'logs') {
      getJSON(`/api/agents/${agent}/logs`)
        .then(setLog)
        .catch((e) => setError(e.message));
    } else {
      getJSON(`/api/agents/${agent}/${tab}`)
        .then(setMessages)
        .catch((e) => setError(e.message));
    }
  }, [agent, tab, version]);

  // auto-scroll de logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const visibleLines = log.lines.filter((l) =>
    l.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50">
      <div className="flex items-center gap-1 border-b border-slate-800 px-3 pt-3">
        <span className="font-semibold mr-3">{agent}</span>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm rounded-t-lg ${
              tab === t
                ? 'bg-slate-800 text-sky-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 max-h-96 overflow-y-auto space-y-3">
        {error && <p className="text-sm text-red-400">Error: {error}</p>}

        {tab !== 'logs' &&
          (messages.length === 0 ? (
            <p className="text-sm text-slate-500">Sin mensajes.</p>
          ) : (
            messages.map((m) => <Message key={m.file} msg={m} />)
          ))}

        {tab === 'logs' && (
          <>
            <div className="flex items-center gap-2 sticky top-0">
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filtrar logs…"
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">{log.date}</span>
            </div>
            {visibleLines.length === 0 ? (
              <p className="text-sm text-slate-500">Sin logs para este día.</p>
            ) : (
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                {visibleLines.join('\n')}
              </pre>
            )}
            <div ref={logEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
