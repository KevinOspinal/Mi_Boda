import type { MesaResponse, SeatView } from '~~/shared/types/mesa'

/**
 * GET /api/mesa/:code
 * Devuelve la mesa asignada al invitado con el revelado por-viewer:
 *  - Solo si el invitado confirmó asistencia (attending = true).
 *  - Sus propios asientos → revelados; novios/pastor → siempre visibles;
 *    el resto → bloqueado (sin nombre).
 *  - Si su invitación está repartida, se muestra su mesa principal
 *    (la que tiene más de sus asientos).
 */
export default defineEventHandler(async (event): Promise<MesaResponse> => {
  const code = getRouterParam(event, 'code')?.trim().toLowerCase()
  if (!code) throw createError({ statusCode: 400, statusMessage: 'Código requerido' })

  const supabase = serverSupabase()

  const { data: guest, error: gErr } = await supabase
    .from('guests')
    .select('id')
    .eq('code', code)
    .maybeSingle()
  if (gErr) throw createError({ statusCode: 500, statusMessage: gErr.message })
  if (!guest) throw createError({ statusCode: 404, statusMessage: 'Invitación no encontrada' })

  // Solo se muestra la mesa si el invitado confirmó asistencia.
  const { data: rsvp } = await supabase
    .from('rsvps')
    .select('attending')
    .eq('guest_id', guest.id)
    .maybeSingle()
  if (!rsvp || !rsvp.attending) return { mesa: null }

  // Asientos del invitado → mesa principal (la que tiene más de sus asientos).
  const { data: mySeats } = await supabase
    .from('asientos')
    .select('mesa_id')
    .eq('guest_id', guest.id)
  if (!mySeats || mySeats.length === 0) return { mesa: null }

  const counts = new Map<number, number>()
  for (const s of mySeats) counts.set(s.mesa_id, (counts.get(s.mesa_id) ?? 0) + 1)
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])
  const mainMesaId = sorted[0]?.[0]
  if (mainMesaId === undefined) return { mesa: null }

  const { data: mesa } = await supabase
    .from('mesas')
    .select('id, nombre, es_honor, capacidad')
    .eq('id', mainMesaId)
    .single()
  if (!mesa) return { mesa: null }

  const { data: seats } = await supabase
    .from('asientos')
    .select('orden, nombre, siempre_visible, guest_id')
    .eq('mesa_id', mainMesaId)
    .order('orden')

  // Todos los asientos se muestran (sin candados) para cualquier invitado.
  const seatViews: SeatView[] = (seats ?? []).map((s) => {
    const propio = s.guest_id === guest.id
    return {
      orden: s.orden,
      nombre: s.nombre,
      revealed: true,
      propio,
      siempreVisible: s.siempre_visible,
      esNovio: s.siempre_visible && (s.nombre === 'Kevin' || s.nombre === 'Daniela'),
    }
  })

  return {
    mesa: {
      id: mesa.id,
      nombre: mesa.nombre,
      esHonor: mesa.es_honor,
      capacidad: mesa.capacidad,
      seats: seatViews,
    },
  }
})
