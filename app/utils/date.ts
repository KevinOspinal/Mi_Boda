/** Utilidades de formato de fecha en español para el evento. */

const LOCALE = 'es-CO'

export function formatLongDate(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(new Date(iso))
}

export function formatTime(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(new Date(iso))
}

/** Capitaliza la primera letra (Intl devuelve "sábado" en minúscula). */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
