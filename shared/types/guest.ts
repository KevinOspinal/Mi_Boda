/**
 * Un invitado de la boda. Se identifica por un `code` único que forma su
 * enlace personal: /invite/<code>  (ej. "kevin", "daniela", "JK82HA").
 */
export interface Guest {
  id: string
  code: string
  /** Nombre a mostrar: "Kevin", "Fam. Martínez Ramírez", etc. */
  displayName: string
  /** Cupo máximo de personas reservadas para este invitado. */
  maxPasses: number
  /** Etiqueta de grupo opcional (mesa, familia, lado de la pareja...). */
  groupLabel: string | null
  /** Primera vez que abrió su invitación (tracking "visto"). */
  openedAt: string | null
}
