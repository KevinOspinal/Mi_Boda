/** Forma tipada de TODO el contenido del evento. Editar solo en app/config/wedding.ts */

export interface Couple {
  brideFirstName: string
  groomFirstName: string
  /** Monograma para el sobre/sello, ej. "K&D". */
  monogram: string
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

export interface WeddingConfig {
  couple: Couple
  /** Fecha/hora del evento en ISO 8601 con zona, para el countdown. */
  date: string
  timezone: string
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
