import type { AdminStats } from '~~/shared/types/admin'

/**
 * GET /api/admin/stats
 * Estadísticas agregadas para el dashboard. Requiere sesión.
 */
export default defineEventHandler(async (event): Promise<AdminStats> => {
  await requireAdmin(event)

  const sql = db()
  const row = requireRow(
    await sql`
    select
      (select count(*) from public.guests)::int                                    as invitaciones,
      (select count(*) from public.rsvps where attending)::int                     as confirmados,
      (select count(*) from public.rsvps where not attending)::int                 as no_asisten,
      (select coalesce(sum(guests_count), 0) from public.rsvps where attending)::int as personas,
      (select count(*) from public.guests where opened_at is not null)::int        as vieron,
      (select coalesce(sum(max_passes), 0) from public.guests)::int                as pases_totales
  `,
    'las estadísticas',
  )

  return {
    invitaciones: row.invitaciones,
    confirmados: row.confirmados,
    noAsisten: row.no_asisten,
    pendientes: row.invitaciones - row.confirmados - row.no_asisten,
    personas: row.personas,
    vieron: row.vieron,
    pasesTotales: row.pases_totales,
  }
})
