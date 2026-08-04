import postgres from 'postgres'

let sql: ReturnType<typeof postgres> | null = null

/**
 * Cliente Postgres (postgres.js). SOLO debe usarse en rutas del servidor
 * (server/api/**). La cadena de conexión nunca se expone al navegador → la
 * lista de invitados permanece privada y no se puede enumerar desde el cliente.
 *
 * Funciona con cualquier Postgres (Seenode, Supabase, Neon, local, …): basta
 * con apuntar NUXT_DATABASE_URL a la cadena de conexión. Si el proveedor exige
 * TLS, inclúyelo en la propia URL con `?sslmode=require`.
 */
export function db() {
  if (sql) return sql

  const config = useRuntimeConfig()
  if (!config.databaseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Base de datos no configurada (revisa NUXT_DATABASE_URL).',
    })
  }

  sql = postgres(config.databaseUrl, {
    max: 5, // pool pequeño: suficiente para una invitación de boda
    idle_timeout: 20,
    connect_timeout: 10,
  })
  return sql
}
