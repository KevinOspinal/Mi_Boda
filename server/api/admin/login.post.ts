import { z } from 'zod'

const loginSchema = z.object({
  password: z.string().min(1).max(200),
})

/**
 * POST /api/admin/login
 * Valida la contraseña compartida y abre sesión (cookie sellada).
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (b) => loginSchema.safeParse(b))
  if (!body.success) {
    throw createError({ statusCode: 422, statusMessage: 'Datos inválidos' })
  }

  const config = useRuntimeConfig()
  if (!config.adminPassword) {
    throw createError({ statusCode: 500, statusMessage: 'Panel no configurado (falta NUXT_ADMIN_PASSWORD).' })
  }

  if (!passwordMatches(body.data.password, config.adminPassword)) {
    throw createError({ statusCode: 401, statusMessage: 'Contraseña incorrecta' })
  }

  const session = await useAdminSession(event)
  await session.update({ authenticated: true })
  return { ok: true }
})
