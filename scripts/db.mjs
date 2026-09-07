#!/usr/bin/env node
/**
 * Utilidades de base de datos para la invitación de boda.
 * No requiere `psql` instalado: usa el mismo driver que la app (postgres.js).
 *
 *   npm run db:restore                     restaura todo (migraciones + datos)
 *   npm run db:restore -- "postgres://…"   contra otra base
 *   npm run db:check                       resumen del estado actual
 *   npm run db:set-url -- https://midominio.com
 *
 * Sin cadena de conexión explícita toma NUXT_DATABASE_URL de `.env.local` y,
 * si no existe, de `.env`. Para forzar un archivo concreto (p. ej. producción):
 *
 *   npm run db:restore -- --env .env
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Lee NUXT_DATABASE_URL del primer archivo de entorno que exista, sin depender
 * de dependencias externas. `.env.local` (desarrollo) gana sobre `.env`, para
 * que un comando lanzado por descuido apunte a la base local y no a producción.
 * Devuelve también el archivo usado, para dejarlo claro en pantalla.
 */
function urlFromEnvFile(only) {
  for (const name of only ? [only] : ['.env.local', '.env']) {
    const file = path.join(root, name)
    if (!fs.existsSync(file)) continue
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq > 0 && trimmed.slice(0, eq).trim() === 'NUXT_DATABASE_URL') {
        return { url: trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, ''), source: name }
      }
    }
  }
  return null
}

/** Oculta la contraseña al mostrar la cadena de conexión en pantalla. */
function mask(url) {
  return url.replace(/(:\/\/[^:/@]+:)[^@]*(@)/, '$1•••$2')
}

const [command, ...args] = process.argv.slice(2)
const explicitUrl = args.find((a) => a.startsWith('postgres://') || a.startsWith('postgresql://'))
// `--env <archivo>` fuerza un archivo concreto. Sin él manda `.env.local` y
// luego `.env`, para que un comando lanzado por descuido toque la base local y
// no la de producción.
const envFlag = args.indexOf('--env')
const onlyEnv = envFlag !== -1 ? args[envFlag + 1] : undefined
const fromFile = explicitUrl || process.env.NUXT_DATABASE_URL ? null : urlFromEnvFile(onlyEnv)
const databaseUrl = explicitUrl || process.env.NUXT_DATABASE_URL || fromFile?.url
const origin = explicitUrl
  ? 'argumento'
  : process.env.NUXT_DATABASE_URL
    ? 'variable de entorno'
    : fromFile?.source

if (!databaseUrl) {
  console.error(
    '✗ Falta la cadena de conexión. Ponla en .env.local o .env (NUXT_DATABASE_URL), o pásala como argumento.',
  )
  process.exit(1)
}

const sql = postgres(databaseUrl, {
  max: 1,
  connect_timeout: 20,
  idle_timeout: 5,
  // Los "already exists, skipping" son esperables (el script es idempotente):
  // se resumen en una línea en vez de volcar el objeto entero del aviso.
  onnotice: (n) => console.log(`  · ${n.message}`),
})

/** Imprime el resumen de lo que hay en la base. */
async function check() {
  const [row] = await sql`
    select
      (select count(*) from public.guests)                        as invitaciones,
      (select coalesce(sum(max_passes), 0) from public.guests)    as pases,
      (select count(*) from public.rsvps)                         as confirmaciones,
      (select count(*) from public.rsvps where attending)         as asisten,
      (select count(*) from public.mesas)                         as mesas,
      (select count(*) from public.asientos)                      as asientos,
      (select site_url from public.wedding_settings where id = 1) as site_url
  `
  console.log(`
  Invitaciones .... ${row.invitaciones}  (${row.pases} pases)
  Confirmaciones .. ${row.confirmaciones}  (${row.asisten} asisten)
  Mesas ........... ${row.mesas}  ·  Asientos: ${row.asientos}
  site_url ........ ${row.site_url}`)
  if (String(row.site_url).includes('REEMPLAZA')) {
    console.log('\n  ⚠ site_url sigue con el valor por defecto.')
    console.log('    Ajústalo tras desplegar:  npm run db:set-url -- https://tudominio.com')
  }
}

try {
  console.log(`→ Conectando a ${mask(databaseUrl)}  (origen: ${origin})\n`)

  if (command === 'restore') {
    const file = path.join(root, 'supabase', 'restore.sql')
    console.log('→ Ejecutando supabase/restore.sql …')
    // .simple() permite enviar el archivo completo (varias sentencias) de una vez.
    await sql.unsafe(fs.readFileSync(file, 'utf8')).simple()
    console.log('✓ Restauración completada.')
    await check()
  } else if (command === 'check') {
    await check()
  } else if (command === 'set-url') {
    const siteUrl = args.find((a) => a.startsWith('http'))
    if (!siteUrl) {
      console.error('✗ Uso: npm run db:set-url -- https://tudominio.com')
      process.exit(1)
    }
    const clean = siteUrl.replace(/\/+$/, '')
    await sql`update public.wedding_settings set site_url = ${clean} where id = 1`
    console.log(`✓ site_url = ${clean}`)
  } else {
    console.error('✗ Comandos: restore | check | set-url <https://…>')
    process.exit(1)
  }
} catch (err) {
  console.error(`\n✗ ${err.code ? err.code + ': ' : ''}${err.message}`)
  process.exitCode = 1
} finally {
  await sql.end({ timeout: 5 })
}
