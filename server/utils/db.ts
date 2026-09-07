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

/**
 * Primera fila de una consulta que SIEMPRE debería devolver una (agregados,
 * `wedding_settings` con su fila única, …).
 *
 * postgres.js devuelve un array, así que `const [row] = await sql\`…\`` deja a
 * `row` como `T | undefined`. Sin esta comprobación, una base a medio migrar
 * provoca un `TypeError` opaco al leer la primera propiedad; con ella sale un
 * 500 que dice exactamente qué faltaba.
 *
 * Para filas que legítimamente pueden no existir (buscar un invitado por su
 * código, p. ej.), NO uses esto: comprueba el `undefined` y lanza un 404.
 */
export function requireRow<T>(rows: readonly T[], descripcion: string): T {
  const row = rows[0]
  if (!row) {
    throw createError({
      statusCode: 500,
      statusMessage: `La base de datos no devolvió ${descripcion}. ¿Faltan migraciones?`,
    })
  }
  return row
}
