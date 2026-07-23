import React from 'react';

export default function AlertsFeed({ alerts, lastUpdate }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Alertas</h2>
        <span className="text-xs text-slate-500">
          status: {lastUpdate || '—'}
        </span>
      </div>
      {alerts.length === 0 ? (
        <p className="text-sm text-slate-500">Sin alertas.</p>
      ) : (
        <ul className="space-y-2 max-h-[32rem] overflow-y-auto">
          {[...alerts].reverse().map((line, i) => (
            <li
              key={i}
              className="text-xs font-mono text-amber-300 bg-amber-950/40 border border-amber-900 rounded px-2 py-1.5"
            >
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
