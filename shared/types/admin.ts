/**
 * Tipos del panel de administración (/admin).
 * Solo se consumen desde endpoints protegidos server/api/admin/**.
 */

/** Estado de una invitación según su confirmación. */
export type InviteStatus = 'confirmado' | 'no_asiste' | 'pendiente'

/** Estadísticas agregadas para el dashboard. */
export interface AdminStats {
  /** Total de invitaciones (filas en guests). */
  invitaciones: number
  /** Invitaciones que confirmaron asistencia. */
  confirmados: number
  /** Invitaciones que declinaron. */
  noAsisten: number
  /** Invitaciones sin responder aún. */
  pendientes: number
  /** Suma de personas confirmadas (guests_count de los que asisten). */
  personas: number
  /** Cuántas invitaciones han abierto su enlace al menos una vez. */
  vieron: number
  /** Suma de pases repartidos (capacidad total invitada). */
  pasesTotales: number
}

/** Estado de reconfirmación de un invitado que ya confirmó. */
export type ReconfirmStatus = 'reconfirmado' | 'por_reconfirmar' | 'cancelado' | 'no_aplica'

/** Una invitación con su confirmación y enlaces listos, para la tabla del panel. */
export interface AdminGuest {
  id: string
  code: string
  displayName: string
  maxPasses: number
  groupLabel: string | null
  phone: string | null
  openedAt: string | null
  status: InviteStatus
  /** Estado de reconfirmación (solo relevante para confirmados). */
  reconfirmStatus: ReconfirmStatus
  /** Datos de la confirmación (null si aún no responde). */
  rsvp: {
    attending: boolean
    guestsCount: number
    attendeeNames: string | null
    dietary: string | null
    message: string | null
    reconfirmed: boolean | null
    updatedAt: string
  } | null
  /** Enlace personal a la invitación. */
  inviteUrl: string
  /** Mensaje sugerido para enviar (plantilla ya interpolada). */
  suggestedMessage: string
  /** Enlace wa.me listo para abrir WhatsApp con el mensaje. */
  whatsappUrl: string
  /** Enlace wa.me con el mensaje de RECONFIRMACIÓN. */
  reconfirmWhatsappUrl: string
}

export interface AdminGuestsResponse {
  guests: AdminGuest[]
  /** Grupos únicos presentes, para el filtro. */
  groups: string[]
}

/** Configuración + resumen de la ventana de reconfirmación (panel). */
export interface AdminReconfirm {
  /** ¿Está abierta ahora mismo? */
  open: boolean
  /** Modo de control. */
  override: 'auto' | 'abrir' | 'cerrar'
  /** Fecha (ISO) en que se abre automáticamente. */
  from: string
  /** Fecha límite (ISO) sugerida a los invitados, o null. */
  deadline: string | null
  /** Cuántos días antes de la boda se abre (parametrizable). */
  diasAntesApertura: number
  /** Cuántos días antes de la boda es la fecha límite, o null. */
  diasAntesLimite: number | null
  /** Días que faltan para la boda (puede ser negativo si ya pasó). */
  diasParaBoda: number
  confirmados: number
  reconfirmados: number
  porReconfirmar: number
  cancelados: number
  /** Personas de invitados que reconfirmaron asistencia. */
  personasSeguras: number
  /** Personas aún vigentes (confirmados que no han cancelado). */
  personasVigentes: number
}
