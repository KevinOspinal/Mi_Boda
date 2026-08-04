import { z } from 'zod'
import type { AdminReconfirm } from '~~/shared/types/admin'

const schema = z.object({
  override: z.enum(['auto', 'abrir', 'cerrar']).optional(),
  /** Cuántos días antes de la boda se abre la reconfirmación. */
  daysBefore: z.number().int().min(0).max(180).optional(),
  /** Cuántos días antes de la boda es la fecha límite (null la quita). */
  deadlineDaysBefore: z.number().int().min(0).max(180).nullable().optional(),
})

/**
 * POST /api/admin/reconfirm
 * Actualiza la configuración de la ventana de reconfirmación (abrir/cerrar/auto,
 * fecha de apertura y fecha límite). Requiere sesión.
 */
export default defineEventHandler(async (event): Promise<AdminReconfirm> => {
  await requireAdmin(event)

  const body = await readValidatedBody(event, (b) => schema.safeParse(b))
  if (!body.success) {
    throw createError({ statusCode: 422, statusMessage: 'Datos inválidos' })
  }
  const { override, daysBefore, deadlineDaysBefore } = body.data
  const sql = db()

  if (override !== undefined) {
    await sql`update public.wedding_settings set reconfirm_override = ${override} where id = 1`
  }
  if (daysBefore !== undefined) {
    await sql`update public.wedding_settings set reconfirm_from = ${weddingMinusDays(daysBefore)} where id = 1`
  }
  if (deadlineDaysBefore !== undefined) {
    const deadline = deadlineDaysBefore === null ? null : weddingMinusDays(deadlineDaysBefore)
    await sql`update public.wedding_settings set reconfirm_deadline = ${deadline} where id = 1`
  }

  return getAdminReconfirm(sql)
})
