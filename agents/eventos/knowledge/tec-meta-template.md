# Plantilla de meta fields — The Events Calendar (TEC)

> Validado en producción (agosto 2026). Todo evento creado/actualizado debe llevar
> este `meta_input` COMPLETO. Las keys distinguen mayúsculas.

```json
{
  "_EventStartDate":        "YYYY-MM-DD HH:MM:SS",
  "_EventEndDate":          "YYYY-MM-DD HH:MM:SS",
  "_EventStartDateUTC":     "YYYY-MM-DD HH:MM:SS",
  "_EventEndDateUTC":       "YYYY-MM-DD HH:MM:SS",
  "_EventDuration":         "10800",
  "_EventTimezone":         "UTC-4",
  "_EventTimezoneAbbr":     "UTC-4",
  "_EventVenueID":          "1089",
  "_EventCost":             "0",
  "_EventOrigin":           "events-calendar",
  "_EventCurrencySymbol":   "$",
  "_EventCurrencyPosition": "prefix",
  "_EventShowMap":          "",
  "_EventShowMapLink":      "",
  "_EventURL":              ""
}
```

## Reglas

- **Mayúsculas exactas** en las keys (`_EventDuration`, no `_eventduration` — TEC las distingue).
- UTC = hora local + 4 (Chile invierno, UTC-4). **Revisar en verano (UTC-3)** — calcular
  según la fecha DEL EVENTO, no la fecha actual (ver gotchas §4).
- `_EventDuration` en **segundos** (3 h = 10800).
- Venues conocidos:
  | Venue | ID |
  |-------|-----|
  | Onplay Games (default) | `1089` |
  | Estación Mapocho | `4324` |
- `post_type: tribe_events`, `post_status: publish` para eventos públicos.
- `_EventCost`: número sin separador de miles ("6000", no "$6.000").
