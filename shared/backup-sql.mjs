/**
 * Generador del SQL de respaldo. Módulo plano (.mjs) a propósito: lo usan tanto
 * el script de terminal (`npm run db:backup`) como el endpoint del panel
 * (`/api/admin/backup`). Una sola implementación, un solo formato de archivo.
 */

/** Columnas exportadas por tabla, en el orden en que se escriben. */
export const TABLES = {
  guests: ['id', 'code', 'display_name', 'max_passes', 'group_label', 'opened_at', 'created_at', 'phone'],
  rsvps: [
    'id', 'guest_id', 'attending', 'guests_count', 'attendee_names', 'phone', 'dietary',
    'message', 'created_at', 'updated_at', 'reconfirmed', 'reconfirmed_at',
  ],
  mesas: ['id', 'nombre', 'capacidad', 'es_honor', 'orden'],
  asientos: ['id', 'mesa_id', 'guest_id', 'nombre', 'siempre_visible', 'orden', 'created_at'],
  wedding_settings: [
    'id', 'site_url', 'invite_message', 'reconfirm_override', 'reconfirm_from', 'reconfirm_deadline',
  ],
}

/** Convierte un valor de Postgres en un literal SQL seguro. */
function lit(value) {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  if (value instanceof Date) return `'${value.toISOString()}'`
  // Comillas simples duplicadas: así se escapan en SQL estándar.
  return `'${String(value).replace(/'/g, "''")}'`
}

/**
 * Bloque `insert into … values …` para una tabla, o un comentario si va vacía.
 *
 * `conflictTarget` sólo se pasa para `wedding_settings`: la migración 0002 crea
 * siempre su fila id=1, así que un `on conflict do nothing` la daría por buena y
 * NUNCA restauraría el dominio ni la plantilla del mensaje. Con `do update` gana
 * el respaldo. Para el resto de tablas `do nothing` es lo correcto: al restaurar
 * sobre una base con datos, no se pisa lo que ya haya.
 */
function insertBlock(table, rows, conflictTarget) {
  const columns = TABLES[table]
  if (rows.length === 0) return `-- (sin filas en public.${table})\n`
  const values = rows.map((r) => '  (' + columns.map((c) => lit(r[c])).join(', ') + ')').join(',\n')
  const onConflict = conflictTarget
    ? `on conflict (${conflictTarget}) do update set\n` +
      columns.filter((c) => c !== conflictTarget).map((c) => `  ${c} = excluded.${c}`).join(',\n')
    : 'on conflict do nothing'
  return `insert into public.${table} (${columns.join(', ')}) values\n${values}\n${onConflict};\n`
}

/** Arma el archivo .sql completo a partir de las filas ya consultadas. */
export function buildBackupSql({ guests, rsvps, mesas, asientos, settings }) {
  return `-- ============================================================================
-- RESPALDO — Boda Kevin & Daniela — ${new Date().toISOString()}
-- ============================================================================
-- Contenido: ${guests.length} invitaciones · ${rsvps.length} confirmaciones · ${mesas.length} mesas · ${asientos.length} asientos
--
-- Para restaurar sobre una base VACÍA:
--   1) aplica las migraciones (supabase/migrations/*.sql)
--   2) ejecuta este archivo
-- Los IDs se conservan, así que los enlaces ya repartidos siguen funcionando.
-- ============================================================================

-- 0) Invitados de demo -------------------------------------------------------
-- La migración 0001 siembra tres invitados de ejemplo. Si no se borran, quedan
-- mezclados con los reales en el panel e inflan las estadísticas.
delete from public.guests where code in ('kevin', 'daniela', 'jk82ha');

-- 1) Invitados ---------------------------------------------------------------
${insertBlock('guests', guests)}
-- 2) Confirmaciones ----------------------------------------------------------
${insertBlock('rsvps', rsvps)}
-- 3) Mesas -------------------------------------------------------------------
${insertBlock('mesas', mesas)}
-- 4) Asientos ----------------------------------------------------------------
${insertBlock('asientos', asientos)}
-- 5) Config del sitio --------------------------------------------------------
${insertBlock('wedding_settings', settings, 'id')}`
}

/**
 * Consultas de respaldo. Las marcas de tiempo se piden con ::text a propósito:
 * Postgres las guarda con precisión de microsegundos, pero postgres.js las
 * convierte a `Date` de JavaScript, que sólo llega a milisegundos. Pasar por ahí
 * perdería los tres últimos dígitos en cada respaldo; como texto salen tal cual.
 */
export async function fetchBackupRows(sql) {
  const [guests, rsvps, mesas, asientos, settings] = await Promise.all([
    sql`select id, code, display_name, max_passes, group_label,
               opened_at::text, created_at::text, phone
        from public.guests order by created_at, id`,
    sql`select id, guest_id, attending, guests_count, attendee_names, phone, dietary, message,
               created_at::text, updated_at::text, reconfirmed, reconfirmed_at::text
        from public.rsvps order by created_at, id`,
    sql`select id, nombre, capacidad, es_honor, orden from public.mesas order by orden, id`,
    sql`select id, mesa_id, guest_id, nombre, siempre_visible, orden, created_at::text
        from public.asientos order by mesa_id, orden, id`,
    sql`select id, site_url, invite_message, reconfirm_override,
               reconfirm_from::text, reconfirm_deadline::text
        from public.wedding_settings order by id`,
  ])
  return { guests, rsvps, mesas, asientos, settings }
}
