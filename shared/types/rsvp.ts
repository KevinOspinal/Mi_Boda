/** Datos que el invitado envía al confirmar (o declinar) asistencia. */
export interface RsvpInput {
  /** Código del invitado dueño de la confirmación. */
  code: string
  attending: boolean
  /** Cantidad de personas que asistirán (<= maxPasses del invitado). */
  guestsCount: number
  attendeeNames?: string
  phone?: string
  dietary?: string
  message?: string
}

/** Registro persistido de una confirmación. */
export interface Rsvp {
  id: string
  guestId: string
  attending: boolean
  guestsCount: number
  attendeeNames: string | null
  phone: string | null
  dietary: string | null
  message: string | null
  createdAt: string
  updatedAt: string
}

/** Estado derivado de un invitado, para estadísticas y panel futuro. */
export type GuestStatus = 'pending' | 'viewed' | 'confirmed' | 'declined'
