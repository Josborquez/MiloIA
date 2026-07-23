# Panel — Ecosistema de Agentes

Interfaz web local para **ver y controlar** el ecosistema de agentes sin romper su protocolo de archivos (`inbox/` → `outbox/`).

## Levantar el panel

```bash
cd agents/panel
npm install

# Desarrollo (backend + Vite con hot-reload)
npm run dev          # UI en http://127.0.0.1:5173, API en http://127.0.0.1:4321

# Producción (build estático servido por Express)
npm run build
npm start            # todo en http://127.0.0.1:4321
```

También desde la raíz de `agents/`: `npm run panel` (producción) o `npm run panel:dev`.

## Qué hace

- **Salud**: tarjetas por agente (`ok` / `lento` / `caído` / `ok-con-error`) desde `dashboard/last-status.json` + feed de `alerts.log`.
- **Actividad**: tabs Inbox / Outbox / Logs por agente, con frontmatter parseado, filtro de logs y actualización en tiempo real (SSE + chokidar).
- **Composer**: envía mensajes al ecosistema escribiendo en `router/inbox/` y muestra la respuesta cuando aparece en `router/outbox/`.
- **Aprobaciones**: lista mensajes de outbox con `requiere-aprobacion: true`; Aprobar/Rechazar escribe un mensaje de confirmación en `router/inbox/`.

## API

| Método | Ruta | Función |
|--------|------|---------|
| GET | `/api/registry` | `registry.json` |
| GET | `/api/status` | `last-status.json` + últimas 50 alertas |
| GET | `/api/agents/:name/inbox` \| `/outbox` | Mensajes con frontmatter parseado |
| GET | `/api/agents/:name/logs?date=YYYY-MM-DD` | Log del día (default hoy) |
| GET | `/api/pending` | Operaciones esperando aprobación |
| GET | `/api/events` | SSE: `status-changed`, `new-inbox`, `new-outbox`, `new-alert`, `new-log` |
| POST | `/api/message` | Escribe mensaje en `router/inbox/` |
| POST | `/api/pending/:id/approve` \| `/reject` | Escribe aprobación/rechazo en `router/inbox/` |

## Restricciones de seguridad

- Servidor bindeado solo a `127.0.0.1` (sin exposición a red).
- Escritura **exclusivamente** en `router/inbox/` (escritura atómica tmp + rename, nombre generado en servidor, sanitización anti-inyección de frontmatter).
- Lectura pura del resto: nunca edita ni borra mensajes, logs, `CLAUDE.md` ni `registry.json`.
- Agentes validados contra `registry.json` (rechaza path traversal); fechas de logs validadas.
- Tolerante a fallos: `last-status.json` corrupto/ausente → estado `desconocido`; carpetas vacías o sin logs del día → listas vacías.
