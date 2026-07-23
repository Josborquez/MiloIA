import React, { useEffect, useState, useCallback } from 'react';
import { getJSON, subscribe } from './api.js';
import HealthGrid from './components/HealthGrid.jsx';
import AgentDetail from './components/AgentDetail.jsx';
import AlertsFeed from './components/AlertsFeed.jsx';
import MessageComposer from './components/MessageComposer.jsx';

export default function App() {
  const [registry, setRegistry] = useState({ agents: [] });
  const [status, setStatus] = useState({ agents: {}, alerts: [], estado: 'desconocido' });
  const [selected, setSelected] = useState(null);
  // contador por agente: se incrementa con eventos SSE para refrescar AgentDetail
  const [versions, setVersions] = useState({});
  const [connected, setConnected] = useState(false);

  const refreshStatus = useCallback(() => {
    getJSON('/api/status').then(setStatus).catch(() => {});
  }, []);

  useEffect(() => {
    getJSON('/api/registry').then(setRegistry).catch(() => {});
    refreshStatus();

    const bump = ({ agent }) =>
      setVersions((v) => ({ ...v, [agent]: (v[agent] || 0) + 1 }));

    return subscribe(
      {
        'status-changed': refreshStatus,
        'new-alert': refreshStatus,
        'new-inbox': bump,
        'new-outbox': bump,
        'new-log': bump,
      },
      setConnected
    );
  }, [refreshStatus]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          Panel — Ecosistema de Agentes
        </h1>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            connected ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
          }`}
        >
          {connected ? 'SSE conectado' : 'SSE desconectado'}
        </span>
      </header>

      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <HealthGrid
            agents={registry.agents}
            status={status.agents}
            selected={selected}
            onSelect={setSelected}
          />
          {selected && (
            <AgentDetail agent={selected} version={versions[selected] || 0} />
          )}
        </section>
        <aside className="space-y-6">
          <MessageComposer
            agents={registry.agents}
            routerVersion={versions.router || 0}
          />
          <AlertsFeed alerts={status.alerts} lastUpdate={status.timestamp} />
        </aside>
      </main>
    </div>
  );
}
