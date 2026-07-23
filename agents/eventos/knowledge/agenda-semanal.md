# Agenda semanal — OnPlay Games

> Agenda tipo de la tienda. El parser-agenda usa esto para completar defaults
> cuando el usuario no especifica horario/precio.
> <!-- COMPLETAR: precios exactos por juego/formato y grilla definitiva -->

## Bloques de horario (lunes a viernes)

| Bloque | Horario | Tipo |
|--------|---------|------|
| Juego libre | 16:00–19:00 | Gratis |
| Weekly (torneo del día) | 19:00–22:00 | Con inscripción |

## Sábados

| Slot | Horario |
|------|---------|
| 1 | 11:00 |
| 2 | 14:30 |
| 3 | 17:00 |

## Duración estándar

- 3 horas por evento (`_EventDuration: 10800`).

## Juegos y precios de inscripción

<!-- COMPLETAR con los valores reales. Ejemplos de estructura: -->

| Juego / Formato | Día habitual | Precio inscripción |
|-----------------|--------------|--------------------|
| Magic — Modern (Weekly) | <!-- día --> | <!-- $ --> |
| Flesh and Blood (Weekly) | <!-- día --> | <!-- $ --> |
| Premodern | sábado | <!-- $ --> |
| <!-- otros --> | | |

## Convenciones de nombre

- Weekly: `<Juego> — Weekly` (ej: "Modern — Weekly").
- Sábados: nombre del formato/torneo.
- Venue default: Onplay Games (`1089`).

## Feriados

- No se agendan eventos en feriados nacionales salvo indicación explícita.
