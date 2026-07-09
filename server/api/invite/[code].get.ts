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

  const supabase = serverSupabase()
  const { data, error } = await supabase
    .from('guests')
    .select('id, code, display_name, max_passes, group_label, opened_at')
    .eq('code', code)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Invitación no encontrada' })
  }

  // Tracking "visto": solo la primera vez, sin bloquear la respuesta.
  if (!data.opened_at) {
    await supabase
      .from('guests')
      .update({ opened_at: new Date().toISOString() })
      .eq('id', data.id)
  }

  // Respuesta previa (si ya confirmó) para no permitir reenviar.
  const { data: rsvpRow } = await supabase
    .from('rsvps')
    .select('attending, guests_count, message')
    .eq('guest_id', data.id)
    .maybeSingle()

  return {
    id: data.id,
    code: data.code,
    displayName: data.display_name,
    maxPasses: data.max_passes,
    groupLabel: data.group_label,
    openedAt: data.opened_at,
    rsvp: rsvpRow
      ? {
          attending: rsvpRow.attending,
          guestsCount: rsvpRow.guests_count,
          message: rsvpRow.message,
        }
      : null,
  }
})
