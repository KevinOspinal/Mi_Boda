/**
 * POST /api/admin/logout
 * Cierra la sesión del panel.
 */
export default defineEventHandler(async (event) => {
  const session = await useAdminSession(event)
  await session.clear()
  return { ok: true }
})
