import type { InviteData } from '~~/shared/types/guest'

/**
 * GET /api/invite/:code
 * Devuelve los datos del invitado, su respuesta previa (si ya confirmó) y
 * marca `opened_at` la primera vez que abre.
 */
export default defineEventHandler(async (event): Promise<InviteData> => {
  const raw = getRouterParam(event, 'code')
  const code = raw?.trim().toLowerCase()
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Código requerido' })
  }

  const sql = db()
  const [data] = await sql`
    select id, code, display_name, max_passes, group_label, opened_at
    from public.guests
    where code = ${code}
    limit 1
  `
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Invitación no encontrada' })
  }

  // Tracking "visto": solo la primera vez, sin bloquear la respuesta.
  if (!data.opened_at) {
    await sql`update public.guests set opened_at = now() where id = ${data.id}`
  }

  // Respuesta previa (si ya confirmó) para no permitir reenviar.
  const [rsvpRow] = await sql`
    select attending, guests_count, message, reconfirmed
    from public.rsvps
    where guest_id = ${data.id}
    limit 1
  `

  // Estado de la ventana de reconfirmación (semanas antes de la boda).
  const reconfirm = await getReconfirmWindow(sql)

  return {
    id: data.id,
    code: data.code,
    displayName: data.display_name,
    maxPasses: data.max_passes,
    groupLabel: data.group_label,
    openedAt: data.opened_at ? new Date(data.opened_at).toISOString() : null,
    rsvp: rsvpRow
      ? {
          attending: rsvpRow.attending,
          guestsCount: rsvpRow.guests_count,
          message: rsvpRow.message,
          reconfirmed: rsvpRow.reconfirmed ?? null,
        }
      : null,
    reconfirm,
  }
})
