-- ============================================================================
-- Reconfirmación de asistencia — Boda Kevin & Daniela
-- Semanas antes del evento, los invitados que YA confirmaron reconfirman su
-- asistencia. Así se liberan puestos de quien finalmente no podrá ir.
-- Ejecutar en el SQL Editor de Supabase / Postgres destino.
-- ============================================================================

-- Estado de reconfirmación por confirmación (rsvp):
--   null  = aún no reconfirma
--   true  = reconfirmó: sigue asistiendo
--   false = canceló en la reconfirmación (libera el puesto)
alter table public.rsvps add column if not exists reconfirmed    boolean;
alter table public.rsvps add column if not exists reconfirmed_at timestamptz;

-- Control de la ventana de reconfirmación (una sola fila en wedding_settings).
--   reconfirm_override: 'auto'   → abierta si now() >= reconfirm_from
--                       'abrir'  → forzada abierta
--                       'cerrar' → forzada cerrada
alter table public.wedding_settings
  add column if not exists reconfirm_override text not null default 'auto'
    check (reconfirm_override in ('auto', 'abrir', 'cerrar'));

-- Fecha en que se abre automáticamente (por defecto: 15 días antes de la boda).
alter table public.wedding_settings
  add column if not exists reconfirm_from timestamptz not null
    default '2026-09-26 00:00:00-05';

-- Fecha límite sugerida que se muestra al invitado (por defecto: 7 días antes).
alter table public.wedding_settings
  add column if not exists reconfirm_deadline timestamptz
    default '2026-10-04 23:59:00-05';

-- Vista de resumen de reconfirmación para el panel.
create or replace view public.reconfirm_summary as
select
  count(*) filter (where r.attending)                                   as confirmados,
  count(*) filter (where r.attending and r.reconfirmed is true)         as reconfirmados,
  count(*) filter (where r.attending and r.reconfirmed is null)         as por_reconfirmar,
  count(*) filter (where r.attending and r.reconfirmed is false)        as cancelados,
  coalesce(sum(r.guests_count) filter (where r.attending and r.reconfirmed is true), 0)  as personas_seguras,
  coalesce(sum(r.guests_count) filter (where r.attending and coalesce(r.reconfirmed, true)), 0) as personas_vigentes
from public.rsvps r;
