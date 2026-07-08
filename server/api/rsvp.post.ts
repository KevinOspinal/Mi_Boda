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

  const supabase = serverSupabase()

  // Resolver invitado y validar cupo en el servidor (nunca confiar en el cliente).
  const { data: guest, error: guestError } = await supabase
    .from('guests')
    .select('id, max_passes')
    .eq('code', input.code)
    .maybeSingle()

  if (guestError) throw createError({ statusCode: 500, statusMessage: guestError.message })
  if (!guest) throw createError({ statusCode: 404, statusMessage: 'Invitación no encontrada' })

  if (input.attending && input.guestsCount > guest.max_passes) {
    throw createError({
      statusCode: 422,
      statusMessage: `El máximo de pases para esta invitación es ${guest.max_passes}.`,
    })
  }

  const now = new Date().toISOString()
  const { error: upsertError } = await supabase.from('rsvps').upsert(
    {
      guest_id: guest.id,
      attending: input.attending,
      guests_count: input.attending ? input.guestsCount : 0,
      attendee_names: input.attendeeNames ?? null,
      phone: input.phone ?? null,
      dietary: input.dietary ?? null,
      message: input.message ?? null,
      updated_at: now,
    },
    { onConflict: 'guest_id' },
  )

  if (upsertError) throw createError({ statusCode: 500, statusMessage: upsertError.message })

  return { ok: true }
})
