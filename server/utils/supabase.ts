import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

/**
 * Cliente Supabase con service-role. SOLO debe usarse en rutas del servidor
 * (server/api/**). Nunca se expone al navegador → la lista de invitados
 * permanece privada y no se puede enumerar desde el cliente.
 */
export function serverSupabase(): SupabaseClient {
  if (cached) return cached

  const config = useRuntimeConfig()
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase no está configurado (revisa NUXT_SUPABASE_URL / NUXT_SUPABASE_SERVICE_KEY).',
    })
  }

  cached = createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}
