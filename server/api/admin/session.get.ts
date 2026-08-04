/**
 * GET /api/admin/session
 * Indica si hay sesión iniciada. Lo usa el middleware de ruta para decidir
 * si redirige al login. No lanza error (siempre responde 200).
 */
export default defineEventHandler(async (event) => {
  const session = await useAdminSession(event)
  return { authenticated: Boolean(session.data?.authenticated) }
})
