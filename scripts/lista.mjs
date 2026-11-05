#!/usr/bin/env node
/**
 * Lista de invitados con su estado, mesa y confirmación.
 *
 *   npm run lista                → base local (.env.local)
 *   npm run lista -- --env .env  → producción
 *   npm run lista -- --mesas     → agrupado por mesa en vez de por grupo
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)

function urlFromEnvFile(only) {
  for (const name of only ? [only] : ['.env.local', '.env']) {
    const file = path.join(root, name)
    if (!fs.existsSync(file)) continue
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const eq = t.indexOf('=')
      if (eq > 0 && t.slice(0, eq).trim() === 'NUXT_DATABASE_URL') {
        return { url: t.slice(eq + 1).trim().replace(/^["']|["']$/g, ''), source: name }
      }
    }
  }
  return null
}

const envFlag = args.indexOf('--env')
const from = urlFromEnvFile(envFlag !== -1 ? args[envFlag + 1] : undefined)
if (!from) {
  console.error('✗ Falta NUXT_DATABASE_URL en .env.local o .env')
  process.exit(1)
}
const sql = postgres(from.url, { max: 1, connect_timeout: 20 })

try {
  console.log(`(origen: ${from.source})`)

  if (args.includes('--mesas')) {
    const mesas = await sql`select id, nombre, capacidad from public.mesas order by orden`
    const seats = await sql`
      select a.mesa_id, a.orden, a.nombre, a.siempre_visible, g.display_name, r.attending
      from public.asientos a
      left join public.guests g on g.id = a.guest_id
      left join public.rsvps r on r.guest_id = g.id
      order by a.mesa_id, a.orden`
    let ocupados = 0
    for (const m of mesas) {
      const s = seats.filter((x) => x.mesa_id === m.id)
      ocupados += s.length
      const libres = m.capacidad - s.length
      console.log(`\n${m.nombre}   ${s.length}/${m.capacidad}${libres ? `   (${libres} libre${libres > 1 ? 's' : ''})` : '   COMPLETA'}`)
      console.log('  ' + '─'.repeat(60))
      for (const x of s) {
        const e = x.siempre_visible && !x.display_name ? '' : x.attending === true ? ' ✓' : x.attending === false ? ' ✗' : ' · pendiente'
        console.log(`  ${String(x.orden).padStart(2)}. ${x.nombre.padEnd(17)}${(x.display_name ?? '—').padEnd(32)}${e}`)
      }
    }
    const cap = mesas.reduce((a, m) => a + m.capacidad, 0)
    console.log(`\n  ${ocupados} ubicadas · ${cap} puestos · ${cap - ocupados} libres`)
  } else {
    const rows = await sql`
      select g.display_name, g.group_label, g.max_passes, g.phone,
             g.opened_at is not null as vio,
             r.attending, r.guests_count, r.reconfirmed, r.message,
             (select string_agg(distinct m.nombre, ', ') from public.asientos a
                join public.mesas m on m.id = a.mesa_id where a.guest_id = g.id) as mesa
      from public.guests g left join public.rsvps r on r.guest_id = g.id
      order by g.group_label nulls last, g.display_name`
    let grupo = null
    for (const r of rows) {
      if (r.group_label !== grupo) { grupo = r.group_label; console.log(`\n── ${grupo ?? 'Sin grupo'} ──`) }
      const estado = r.attending == null ? 'PENDIENTE' : r.attending ? 'CONFIRMADO' : 'NO ASISTE'
      const marca = estado === 'CONFIRMADO' ? '✓' : estado === 'NO ASISTE' ? '✗' : '·'
      const pers = estado === 'CONFIRMADO' ? `${r.guests_count}/${r.max_passes}` : `—/${r.max_passes}`
      const rec = r.reconfirmed === true ? ' [reconfirmó]' : r.reconfirmed === false ? ' [CANCELÓ]' : ''
      const avisos = [!r.vio && 'no ha abierto', !r.phone && 'sin teléfono'].filter(Boolean)
      console.log(`  ${marca} ${r.display_name.padEnd(34)} ${pers.padEnd(6)} ${(r.mesa ?? 'SIN MESA').padEnd(15)} ${estado}${rec}${avisos.length ? `  (${avisos.join(', ')})` : ''}`)
      if (r.message) console.log(`      💬 "${r.message}"`)
    }
  }

  const [t] = await sql`
    select count(*)::int invitaciones,
           coalesce(sum(g.max_passes), 0)::int pases,
           count(*) filter (where r.attending)::int confirmadas,
           count(*) filter (where r.attending = false)::int no_asisten,
           count(*) filter (where r.id is null)::int pendientes,
           coalesce(sum(r.guests_count) filter (where r.attending), 0)::int personas
    from public.guests g left join public.rsvps r on r.guest_id = g.id`
  console.log(`\n${'═'.repeat(78)}`)
  console.log(`  ${t.invitaciones} invitaciones (${t.pases} pases) · ✓ ${t.confirmadas} · ✗ ${t.no_asisten} · · ${t.pendientes} pendientes`)
  console.log(`  PERSONAS CONFIRMADAS: ${t.personas}`)
} catch (err) {
  console.error(`\n✗ ${err.code ? err.code + ': ' : ''}${err.message}`)
  process.exitCode = 1
} finally {
  await sql.end({ timeout: 5 })
}
