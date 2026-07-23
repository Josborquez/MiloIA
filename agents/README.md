# Ecosistema de Agentes

Arquitectura de tres capas para orquestar agentes autónomos 24/7 en hardware local.
Basado en: https://www.tododeia.com/community/ecosistema-de-agentes

## Arquitectura

| Capa | Agente | Función |
|------|--------|---------|
| 1 | `dashboard/` | Monitoreo de salud (ping horario, `last-status.json`, `alerts.log`) |
| 2 | `router/` | Único punto de entrada: recibe mensajes (Telegram/WhatsApp/Slack) y dispatcha vía `inbox/`/`outbox/` |
| 3 | `email/`, `company/`, `ecommerce/` | Agentes especializados con sub-agentes en `.claude/agents/` |

## Estructura

```
agents/
├── registry.json
├── dashboard/   → inbox/ outbox/ logs/ CLAUDE.md last-status.json alerts.log
├── router/      → inbox/ outbox/ logs/ CLAUDE.md
├── email/       → inbox/ outbox/ logs/ CLAUDE.md voice.md
│   └── .claude/agents/ (classifier.md, drafter.md, summarizer.md)
├── company/     → inbox/ outbox/ logs/ CLAUDE.md tone.md
│   ├── kb/ (products/, contracts/, policies/, team/)
│   └── .claude/agents/ (lookup.md, comparer.md, drafter-interno.md)
└── ecommerce/   → inbox/ outbox/ logs/ CLAUDE.md brand-voice.md
    └── .claude/agents/ (shopify-ops.md, research.md, copywriter.md)
```

## Especificaciones técnicas

- **Hardware**: Mac mini M4 base (16GB RAM) o equivalente Linux.
- **Suscripción Claude**: Pro ($20), Max 5× ($100) o Max 20× ($200). Sin API key separada.
- **Anti-sleep (macOS)**: `pmset -a sleep 0 autorestart 1` y `caffeinate -dimsu &`

## Errores comunes y soluciones

1. **Agente con demasiadas responsabilidades** → particionar en sub-agentes en `.claude/agents/`.
2. **Router con lógica de negocio** → eliminar; mantener solo tabla de dispatch (< 40 líneas).
3. **Drafts genéricos** → sub-agente drafter con archivo `voice.md` / `brand-voice.md`.
4. **Rate limiting** → subir a Max 5× o Max 20×.
5. **Mac durmiendo** → comandos anti-sleep y relanzar Claude Code automáticamente.

## Modelo de facturación

- **One-time**: setup inicial ($1,500–$5,000).
- **Mensual**: mantenimiento + suscripción Claude (el cliente paga a Anthropic directamente).
- **Aislamiento**: Mac mini dedicada por cliente cuando escala.
