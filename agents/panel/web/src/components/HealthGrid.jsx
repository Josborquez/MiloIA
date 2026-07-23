import React from 'react';

const STATUS_STYLES = {
  ok: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  lento: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  'caído': 'bg-red-900/60 text-red-300 border-red-700',
  'ok-con-error': 'bg-orange-900/60 text-orange-300 border-orange-700',
  desconocido: 'bg-slate-800 text-slate-400 border-slate-700',
};

export default function HealthGrid({ agents, status, selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {agents.map((agent) => {
        const st = status[agent.name] || {};
        const estado = st.status || 'desconocido';
        const style = STATUS_STYLES[estado] || STATUS_STYLES.desconocido;
        const isSelected = selected === agent.name;
        return (
          <button
            key={agent.name}
            onClick={() => onSelect(isSelected ? null : agent.name)}
            className={`text-left rounded-xl border p-4 transition hover:border-slate-500 ${
              isSelected ? 'border-sky-500 bg-slate-900' : 'border-slate-800 bg-slate-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{agent.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${style}`}>
                {estado}
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-2">{agent.role}</p>
            <p className="text-xs text-slate-500">
              Último ping: {st.last_ping || '—'}
            </p>
            {st.last_error && (
              <p className="text-xs text-red-400 mt-1 truncate" title={st.last_error}>
                {st.last_error}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
