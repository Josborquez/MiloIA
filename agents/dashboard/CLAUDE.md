# Agent Dashboard

## Función
Monitoreo de salud del ecosistema de agentes. Capa 1 de la arquitectura.

## Responsabilidades
- Leer `../registry.json` (lista compartida de agentes).
- Realizar ping horario a cada agente registrado.
- Registrar estado de cada agente: `ok`, `lento`, `caído`, `ok-con-error`.
- Devolver JSON con timestamps en formato ISO 8601 y últimos errores.
- Escribir resultados en `last-status.json`.
- Registrar alertas en `alerts.log`.

## Restricciones
- NO interpreta mensajes.
- NO ejecuta lógica de negocio.
- Solo monitorea y reporta.

## Archivos clave
- `last-status.json`: último estado conocido de cada agente.
- `alerts.log`: historial de alertas.
- `logs/`: registros de ejecución.

## Formato de salida (ejemplo)
```json
{
  "timestamp": "2026-07-23T12:00:00Z",
  "agents": {
    "router": { "status": "ok", "last_error": null },
    "email": { "status": "lento", "last_error": null },
    "company": { "status": "ok", "last_error": null },
    "ecommerce": { "status": "caído", "last_error": "timeout en ping" }
  }
}
```
