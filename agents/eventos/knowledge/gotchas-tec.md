# Gotchas conocidos — The Events Calendar en onplaygames.cl

> Leer ANTES de diagnosticar problemas o sospechar que "TEC está roto".

## 1. TEC 6.17 y las tablas personalizadas (CT1) — el gotcha principal

- TEC lista eventos desde sus tablas internas, NO desde `wp_posts`/`wp_postmeta` directamente.
- Los eventos creados vía `wp_insert_post` (como hace el MCP) **no aparecen** en el calendario
  ni en la REST API de TEC si el sitio está en modo tablas personalizadas "completo".
- **Estado que funciona hoy (NO TOCAR)**:
  - `tec_ct1_active = true`
  - `tec_custom_tables_v1_active = true`
  - `tec_ct1_migration_state.phase = "migration-required"`
- Este estado hace que TEC consulte por postmeta (fallback), donde sí están los eventos.
- **NUNCA** poner `phase = "migration-complete"` sin haber migrado de verdad: rompe el
  listado (verificado empíricamente).
- Si en el admin de WP aparece el aviso de migración de TEC, no ejecutarla sin plan.

## 2. Herramienta correcta para actualizar

- `update_posts` (REST WP) **falla** con `tribe_events` ("ID de entrada no válido").
- Usar siempre `wp_update_post` (PHP).

## 3. Verificación de escrituras

- Que el post exista NO garantiza que TEC lo muestre.
- Verificar siempre con `GET /wp-json/tribe/events/v1/events/?start_date=X&end_date=Y`.
- La API por ID (`/events/<id>`) puede responder OK aunque el evento no salga en listados:
  verificar contra el **listado**, no por ID.
- Cachés (Cloudflare/page cache): añadir un query param dummy (`&_t=N`) al verificar.

## 4. Zona horaria

- Chile alterna UTC-4 (invierno, abr–sep) / UTC-3 (verano, sep–abr).
- El parser debe calcular las fechas UTC según la **fecha del evento**, no la fecha actual.
