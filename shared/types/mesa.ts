/** Un asiento tal como lo ve un invitado (con el revelado ya aplicado). */
export interface SeatView {
  orden: number
  /** Nombre si está revelado; null si está bloqueado. */
  nombre: string | null
  revealed: boolean
  /** Pertenece a la invitación del que mira. */
  propio: boolean
  siempreVisible: boolean
  /** Es uno de los novios (ver couple.honorSeatNames) → se le pone corona. */
  esNovio?: boolean
}

/** La mesa asignada a un invitado, lista para renderizar. */
export interface MesaView {
  id: number
  nombre: string
  esHonor: boolean
  capacidad: number
  seats: SeatView[]
}

/** Respuesta del endpoint de mesa. `mesa` es null si aún no aplica mostrarla. */
export interface MesaResponse {
  mesa: MesaView | null
}
