#!/usr/bin/env node
/**
 * Respaldo de la base de datos de la boda.
 *
 *   npm run db:backup                     → backups/boda-<fecha>.sql
 *   npm run db:backup -- "postgres://…"   → contra otra base
 *   npm run db:backup -- --env .env       → contra la base de producción
 *
 * Genera un .sql con el MISMO formato que supabase/seed_data.sql, así que se
 * restaura igual: se ejecuta después de las migraciones y listo. No necesita
 * `pg_dump` instalado; usa el driver de la app.
 *
 * Conserva los IDs, de modo que los enlaces ya repartidos por WhatsApp siguen
 * funcionando tras una restauración.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import { buildBackupSql, fetchBackupRows } from '../shared/backup-sql.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

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

const mask = (url) => url.replace(/(:\/\/[^:/@]+:)[^@]*(@)/, '$1•••$2')

const args = process.argv.slice(2)
const explicitUrl = args.find((a) => a.startsWith('postgres://') || a.startsWith('postgresql://'))
// `--env <archivo>` fuerza un archivo concreto. Sin él manda `.env.local` y
// luego `.env`, para que un comando lanzado por descuido toque la base local y
// no la de producción.
const envFlag = args.indexOf('--env')
const onlyEnv = envFlag !== -1 ? args[envFlag + 1] : undefined
const fromFile = explicitUrl || process.env.NUXT_DATABASE_URL ? null : urlFromEnvFile(onlyEnv)
const databaseUrl = explicitUrl || process.env.NUXT_DATABASE_URL || fromFile?.url
const origin = explicitUrl ? 'argumento' : process.env.NUXT_DATABASE_URL ? 'entorno' : fromFile?.source

if (!databaseUrl) {
  console.error('✗ Falta la cadena de conexión (NUXT_DATABASE_URL en .env.local o .env).')
  process.exit(1)
}

const sql = postgres(databaseUrl, { max: 1, connect_timeout: 20, idle_timeout: 5 })

try {
  console.log(`→ Respaldando ${mask(databaseUrl)}  (origen: ${origin})\n`)

  const rows = await fetchBackupRows(sql)
  const out = buildBackupSql(rows)
  const { guests, rsvps, mesas, asientos } = rows
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')

  const dir = path.join(root, 'backups')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `boda-${stamp}.sql`)
  fs.writeFileSync(file, out)

  const kb = (fs.statSync(file).size / 1024).toFixed(1)
  console.log(`✓ backups/boda-${stamp}.sql  (${kb} KB)

  Invitaciones .... ${guests.length}
  Confirmaciones .. ${rsvps.length}  (${rsvps.filter((r) => r.attending).length} asisten)
  Mesas ........... ${mesas.length}  ·  Asientos: ${asientos.length}`)
} catch (err) {
  console.error(`\n✗ ${err.code ? err.code + ': ' : ''}${err.message}`)
  process.exitCode = 1
} finally {
  await sql.end({ timeout: 5 })
}
