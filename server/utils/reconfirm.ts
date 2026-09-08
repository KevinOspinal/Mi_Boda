import type { ReconfirmWindow } from '~~/shared/types/guest'
import type { AdminReconfirm } from '~~/shared/types/admin'

/** Fecha y hora de la boda (Kevin & Daniela). */
const WEDDING_ISO = '2026-10-11T15:00:00-05:00'
/** Medianoche del día de la boda (zona Bogotá, sin horario de verano). */
const WEDDING_DAY_ISO = '2026-10-11T00:00:00-05:00'
const DAY_MS = 86_400_000

/** Devuelve el instante de "N días antes" de la boda, a la medianoche de Bogotá. */
export function weddingMinusDays(days: number): string {
  return new Date(new Date(WEDDING_DAY_ISO).getTime() - days * DAY_MS).toISOString()
}

/** Cuántos días antes de la boda cae un instante dado (entero, Bogotá sin DST). */
function daysBeforeWedding(iso: string): number {
  return Math.round((new Date(WEDDING_DAY_ISO).getTime() - new Date(iso).getTime()) / DAY_MS)
}

/** Fila de configuración que necesitan tanto la vista pública como el panel. */
interface WindowSettings {
  /** La tabla lo restringe con un CHECK a estos tres valores. */
  reconfirm_override: AdminReconfirm['override']
  reconfirm_from: string | Date
  reconfirm_deadline: string | Date | null
  server_now: string | Date
}

/**
 * Decide si la ventana está abierta:
 *   - override 'abrir'  → siempre abierta
 *   - override 'cerrar' → siempre cerrada
 *   - override 'auto'   → abierta cuando la fecha del servidor ya pasó reconfirm_from
 *
 * Vive aparte porque la usan la vista del invitado y la del panel: si cada una
 * lleva su copia, tarde o temprano dicen cosas distintas.
 */
function isWindowOpen(s: WindowSettings): boolean {
  if (s.reconfirm_override === 'abrir') return true
  if (s.reconfirm_override === 'cerrar') return false
  return new Date(s.server_now) >= new Date(s.reconfirm_from)
}

/**
 * Ventana de reconfirmación tal como la ve el invitado, con la fecha límite
 * sugerida. Si la configuración no existiera, se responde "cerrada" en vez de
 * fallar: el invitado debe poder ver su invitación igual.
 */
export async function getReconfirmWindow(sql: ReturnType<typeof db>): Promise<ReconfirmWindow> {
  const [s] = await sql<WindowSettings[]>`
    select reconfirm_override, reconfirm_from, reconfirm_deadline, now() as server_now
    from public.wedding_settings
    where id = 1
  `
  if (!s) return { open: false, deadline: null }

  const open = isWindowOpen(s)

  return {
    open,
    deadline: s.reconfirm_deadline ? new Date(s.reconfirm_deadline).toISOString() : null,
  }
}

/**
 * Configuración + resumen de reconfirmación para el panel de administración.
 */
export async function getAdminReconfirm(sql: ReturnType<typeof db>): Promise<AdminReconfirm> {
  const s = requireRow(
    await sql<WindowSettings[]>`
      select reconfirm_override, reconfirm_from, reconfirm_deadline, now() as server_now
      from public.wedding_settings
      where id = 1
    `,
    'la configuración de la boda (wedding_settings)',
  )
  const sum = requireRow(await sql`select * from public.reconfirm_summary`, 'el resumen de reconfirmación')

  const open = isWindowOpen(s)

  const diasParaBoda = Math.ceil(
    (new Date(WEDDING_ISO).getTime() - new Date(s.server_now).getTime()) / 86_400_000,
  )

  const fromIso = new Date(s.reconfirm_from).toISOString()
  const deadlineIso = s.reconfirm_deadline ? new Date(s.reconfirm_deadline).toISOString() : null

  return {
    open,
    override: s.reconfirm_override,
    from: fromIso,
    deadline: deadlineIso,
    diasAntesApertura: daysBeforeWedding(fromIso),
    diasAntesLimite: deadlineIso ? daysBeforeWedding(deadlineIso) : null,
    diasParaBoda,
    confirmados: Number(sum.confirmados),
    reconfirmados: Number(sum.reconfirmados),
    porReconfirmar: Number(sum.por_reconfirmar),
    cancelados: Number(sum.cancelados),
    personasSeguras: Number(sum.personas_seguras),
    personasVigentes: Number(sum.personas_vigentes),
  }
}
