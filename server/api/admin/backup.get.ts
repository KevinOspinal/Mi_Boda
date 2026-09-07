import { buildBackupSql, fetchBackupRows } from '~~/shared/backup-sql.mjs'

/**
 * GET /api/admin/backup
 * Descarga un respaldo completo de la base en formato .sql. Requiere sesión.
 *
 * Es el mismo archivo que genera `npm run db:backup`, para que los novios
 * puedan respaldar desde el panel sin necesidad de terminal.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const rows = await fetchBackupRows(db())
  const sqlDump: string = buildBackupSql(rows)

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  setHeader(event, 'content-type', 'application/sql; charset=utf-8')
  setHeader(event, 'content-disposition', `attachment; filename="boda-${stamp}.sql"`)
  // Un respaldo nunca debe servirse desde caché: siempre el estado de ahora.
  setHeader(event, 'cache-control', 'no-store')

  return sqlDump
})
