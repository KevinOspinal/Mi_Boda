import { timingSafeEqual } from 'node:crypto'

/**
 * Sesión del panel de administración. Cookie sellada (cifrada) con h3
 * `useSession`; el navegador nunca ve el contenido, solo un token opaco.
 */
export async function useAdminSession(event: Parameters<typeof getRequestURL>[0]) {
  const config = useRuntimeConfig()
  const sessionPassword = config.adminSessionPassword ? String(config.adminSessionPassword) : ''
  if (sessionPassword.length < 32) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Panel no configurado (falta NUXT_ADMIN_SESSION_PASSWORD, mínimo 32 caracteres).',
    })
  }
  return await useSession<{ authenticated: boolean }>(event, {
    name: 'boda_admin',
    password: sessionPassword,
    cookie: { sameSite: 'lax' },
  })
}

/**
 * Exige sesión válida. Úsalo al inicio de cada endpoint /api/admin/**.
 * Lanza 401 si no hay sesión iniciada.
 */
export async function requireAdmin(event: Parameters<typeof getRequestURL>[0]) {
  const session = await useAdminSession(event)
  if (!session.data?.authenticated) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
  }
}

/**
 * Compara la contraseña recibida contra la configurada en tiempo constante
 * (evita filtrar la longitud/contenido por diferencias de tiempo).
 * Se fuerza a string: algunas plataformas pueden inyectar variables de
 * entorno puramente numéricas (p. ej. "12345678") como tipo number.
 */
export function passwordMatches(input: string, expected: string): boolean {
  const a = Buffer.from(String(input))
  const b = Buffer.from(String(expected))
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
