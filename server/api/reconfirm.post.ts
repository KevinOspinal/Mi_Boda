import { z } from 'zod'

const reconfirmSchema = z.object({
  code: z.string().trim().min(1).toLowerCase(),
  /** true = sigue asistiendo; false = ya no podrá (libera el puesto). */
  coming: z.boolean(),
})

/**
 * POST /api/reconfirm
 * Reconfirmación de asistencia (semanas antes de la boda). Solo válida si:
 *   - la ventana de reconfirmación está abierta, y
 *   - el invitado ya había confirmado asistencia (attending = true).
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (b) => reconfirmSchema.safeParse(b))
  if (!body.success) {
    throw createError({ statusCode: 422, statusMessage: 'Datos inválidos' })
  }
  const input = body.data

  const sql = db()

  // La ventana debe estar abierta (nunca confiar solo en el cliente).
  const window = await getReconfirmWindow(sql)
  if (!window.open) {
    throw createError({ statusCode: 409, statusMessage: 'La reconfirmación no está abierta.' })
  }

  const [guest] = await sql`select id from public.guests where code = ${input.code} limit 1`
  if (!guest) throw createError({ statusCode: 404, statusMessage: 'Invitación no encontrada' })

  // Solo puede reconfirmar quien ya había confirmado asistencia.
  const [rsvp] = await sql`select attending from public.rsvps where guest_id = ${guest.id} limit 1`
  if (!rsvp || !rsvp.attending) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Solo puedes reconfirmar si ya habías confirmado tu asistencia.',
    })
  }

  await sql`
    update public.rsvps
    set reconfirmed = ${input.coming}, reconfirmed_at = now()
    where guest_id = ${guest.id}
  `

  return { ok: true, coming: input.coming }
})
