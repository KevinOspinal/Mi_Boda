import type { AdminReconfirm } from '~~/shared/types/admin'

/**
 * GET /api/admin/reconfirm
 * Configuración y resumen de la ventana de reconfirmación. Requiere sesión.
 */
export default defineEventHandler(async (event): Promise<AdminReconfirm> => {
  await requireAdmin(event)
  return getAdminReconfirm(db())
})
