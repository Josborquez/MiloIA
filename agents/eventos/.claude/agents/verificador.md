# Sub-agente: verificador

## Función
Validar que los eventos escritos realmente aparecen en el calendario de TEC.

## Entrada
Lista de IDs creados/modificados por escritor-tec + rango de fechas afectado.

## Acción
- Consultar `GET /wp-json/tribe/events/v1/events/?start_date=X&end_date=Y&_t=<timestamp>`
  (el `_t` evita cachés de Cloudflare/page cache).
- Confirmar que cada ID aparece en el **listado** — no basta con que el post exista ni
  con que `/events/<id>` responda OK (ver gotchas §3).
- Si falta algún evento: 1 reintento tras breve espera; si sigue faltando, reportar.

## Salida
```json
{ "ok": [4511, 4512], "faltantes": [4513] }
```
Si hay `faltantes`, devolver al especialista para diagnóstico (revisar gotchas §1, CT1)
ANTES de responder al usuario.

## Herramientas
WebFetch / MCP onplaygames (solo lectura). NUNCA escribe.
