import { z } from 'zod'

const rsvpSchema = z.object({
  code: z.string().trim().min(1).toLowerCase(),
  attending: z.boolean(),
  guestsCount: z.number().int().min(0).max(20),
  attendeeNames: z.string().trim().max(500).optional(),
  phone: z.string().trim().max(40).optional(),
  dietary: z.string().trim().max(500).optional(),
  message: z.string().trim().max(1000).optional(),
})

/**
 * POST /api/rsvp
 * Valida y persiste (upsert por invitado) la confirmación de asistencia.
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (b) => rsvpSchema.safeParse(b))
  if (!body.success) {
    throw createError({ statusCode: 422, statusMessage: 'Datos inválidos', data: body.error.flatten() })
  }
  const input = body.data

  const sql = db()

  // Resolver invitado y validar cupo en el servidor (nunca confiar en el cliente).
  const [guest] = await sql`
    select id, max_passes from public.guests where code = ${input.code} limit 1
  `
  if (!guest) throw createError({ statusCode: 404, statusMessage: 'Invitación no encontrada' })

  if (input.attending && input.guestsCount > guest.max_passes) {
    throw createError({
      statusCode: 422,
      statusMessage: `El máximo de pases para esta invitación es ${guest.max_passes}.`,
    })
  }

  // Upsert por invitado (una confirmación por guest_id).
  await sql`
    insert into public.rsvps
      (guest_id, attending, guests_count, attendee_names, phone, dietary, message, updated_at)
    values (
      ${guest.id},
      ${input.attending},
      ${input.attending ? input.guestsCount : 0},
      ${input.attendeeNames ?? null},
      ${input.phone ?? null},
      ${input.dietary ?? null},
      ${input.message ?? null},
      now()
    )
    on conflict (guest_id) do update set
      attending      = excluded.attending,
      guests_count   = excluded.guests_count,
      attendee_names = excluded.attendee_names,
      phone          = excluded.phone,
      dietary        = excluded.dietary,
      message        = excluded.message,
      updated_at     = now()
  `

  return { ok: true }
})
