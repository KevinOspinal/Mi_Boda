/** Forma tipada de TODO el contenido del evento. Editar solo en app/config/wedding.ts */

export interface Couple {
  brideFirstName: string
  groomFirstName: string
  /** Monograma para el sobre/sello, ej. "K&D". */
  monogram: string
  /**
   * Nombres tal como aparecen en los asientos de la mesa de honor.
   * Sirve para resaltarlos con el estilo de "novios" en el plano de mesas.
   */
  honorSeatNames?: string[]
}

export interface StoryBlock {
  title: string
  text: string
  image?: string
}

export interface ItineraryItem {
  time: string // "18:00"
  title: string // "Ceremonia"
  description?: string
  icon?: string
}

export interface EventVenue {
  label: string // "Ceremonia" | "Recepción"
  name: string
  address: string
  /** Coordenadas para el mapa y el botón "Cómo llegar". */
  lat: number
  lng: number
  mapsUrl?: string
}

/** Textos para las tarjetas de WhatsApp y los metadatos al compartir. */
export interface WeddingSeo {
  /**
   * Una línea con fecha y lugar, ej.
   * "11 de Octubre de 2026 · Casa campestre Kamaura, El Cerrito, Valle".
   * Se usa en la descripción OG de la portada y de cada invitación.
   */
  tagline: string
  /** Imagen 1200x630 para la tarjeta al compartir, relativa a /public. */
  ogImage: string
}

/**
 * Plantillas de los mensajes de WhatsApp. Admiten dos marcadores:
 *   {name} → nombre del invitado      {link} → su enlace personal
 */
export interface WeddingMessages {
  /** Primera invitación. La base de datos puede sobrescribirla desde el panel. */
  invite: string
  /** Recordatorio para reconfirmar cuando se acerca la fecha. */
  reconfirm: string
}

export interface WeddingConfig {
  couple: Couple
  /** Fecha/hora del evento en ISO 8601 con zona, para el countdown. */
  date: string
  timezone: string
  /** Fecha escrita para humanos, ej. "Domingo 11 de Octubre de 2026". */
  dateLabel: string
  seo: WeddingSeo
  messages: WeddingMessages
  hero: {
    title: string // "Nuestra Boda"
    saveTheDate: string
  }
  story: StoryBlock[]
  venues: EventVenue[]
  itinerary: ItineraryItem[]
  dressCode: {
    title: string
    /** Nivel de etiqueta destacado, ej. "Elegante". */
    level: string
    description: string
    palette?: string[]
  }
  gifts?: {
    title: string
    description: string
    url?: string
  }
  lodging?: {
    title: string
    description: string
  }
  music?: {
    /** Ruta al audio de fondo (opcional; sin autoplay). */
    src: string
    title: string
  }
  farewell: {
    title: string
    message: string
  }
}
