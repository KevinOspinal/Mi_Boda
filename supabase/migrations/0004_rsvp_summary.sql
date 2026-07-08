-- ============================================================================
-- Vista de resumen de confirmaciones (RSVP) para monitorear fácilmente.
-- Ejecutar en el SQL Editor de Supabase. Luego: select * from rsvp_summary;
-- ============================================================================

create or replace view public.rsvp_summary as
select
  g.display_name                               as invitacion,
  g.group_label                                as grupo,
  case
    when r.id is null      then 'Pendiente'
    when r.attending       then 'Confirmado'
    else                        'No asiste'
  end                                          as estado,
  g.max_passes                                 as pases,
  coalesce(r.guests_count, 0)                  as asistentes,
  r.message                                    as mensaje,
  (g.opened_at is not null)                    as vio_invitacion,
  r.updated_at                                 as respondio_en
from public.guests g
left join public.rsvps r on r.guest_id = g.id;

-- Estadísticas rápidas:
--   select
--     count(*) filter (where estado = 'Confirmado')            as confirmados,
--     count(*) filter (where estado = 'No asiste')             as no_asisten,
--     count(*) filter (where estado = 'Pendiente')             as pendientes,
--     count(*) filter (where vio_invitacion)                   as vieron,
--     coalesce(sum(asistentes), 0)                             as personas_confirmadas
--   from public.rsvp_summary;
