import type { MesaResponse, SeatView } from '~~/shared/types/mesa'
import { wedding } from '~~/app/config/wedding'

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

  const sql = db()

  const [guest] = await sql`select id from public.guests where code = ${code} limit 1`
  if (!guest) throw createError({ statusCode: 404, statusMessage: 'Invitación no encontrada' })

  // Solo se muestra la mesa si el invitado confirmó asistencia.
  const [rsvp] = await sql`
    select attending from public.rsvps where guest_id = ${guest.id} limit 1
  `
  if (!rsvp || !rsvp.attending) return { mesa: null }

  // Asientos del invitado → mesa principal (la que tiene más de sus asientos).
  const mySeats = await sql`
    select mesa_id from public.asientos where guest_id = ${guest.id}
  `
  if (mySeats.length === 0) return { mesa: null }

  const counts = new Map<number, number>()
  for (const s of mySeats) counts.set(s.mesa_id, (counts.get(s.mesa_id) ?? 0) + 1)
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])
  const mainMesaId = sorted[0]?.[0]
  if (mainMesaId === undefined) return { mesa: null }

  const [mesa] = await sql`
    select id, nombre, es_honor, capacidad from public.mesas where id = ${mainMesaId} limit 1
  `
  if (!mesa) return { mesa: null }

  const seats = await sql`
    select orden, nombre, siempre_visible, guest_id
    from public.asientos
    where mesa_id = ${mainMesaId}
    order by orden
  `

  // Quiénes van resaltados como "los novios" (configurable por evento).
  const honorNames = wedding.couple.honorSeatNames ?? [
    wedding.couple.groomFirstName,
    wedding.couple.brideFirstName,
  ]

  // Todos los asientos se muestran (sin candados) para cualquier invitado.
  const seatViews: SeatView[] = seats.map((s) => {
    const propio = s.guest_id === guest.id
    return {
      orden: s.orden,
      nombre: s.nombre,
      revealed: true,
      propio,
      siempreVisible: s.siempre_visible,
      esNovio: s.siempre_visible && honorNames.includes(s.nombre),
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
