// Ruta relativa a propósito: este archivo también lo lee nuxt.config.ts, que se
// carga antes de que existan los alias (~~/), y ahí un alias no resolvería.
import type { WeddingConfig } from '../../shared/types/wedding'

export const wedding: WeddingConfig = {
  couple: {
    brideFirstName: 'Daniela',
    groomFirstName: 'Kevin',
    monogram: 'K&D',
    // Nombres que van resaltados como "los novios" en el plano de mesas.
    honorSeatNames: ['Kevin', 'Daniela'],
  },

  date: '2026-10-11T15:00:00-05:00',
  timezone: 'America/Bogota',
  dateLabel: 'Domingo 11 de Octubre de 2026',

  // Lo que se ve al compartir el enlace por WhatsApp o redes.
  seo: {
    tagline: '11 de Octubre de 2026 · Casa campestre Kamaura, El Cerrito, Valle.',
    ogImage: '/og/invitation.jpg',
    demoCode: 'kevin',
  },

  // Mensajes de WhatsApp. {name} = nombre del invitado · {link} = su enlace.
  messages: {
    invite: `✨ *Kevin & Daniela se casan* ✨

Hola {name}, con el corazón lleno de alegría queremos invitarte a celebrar nuestra boda 💍

🗓️ Domingo 11 de Octubre de 2026
📍 Casa campestre Kamaura · El Cerrito, Valle

Toca tu invitación personal para ver todos los detalles y confirmar tu asistencia 👇
{link}

Con cariño,
Kevin & Daniela 🤍`,

    reconfirm: `Hola {name} 💍 ¡Ya casi es el gran día!

Como cada lugar en la boda es muy especial para nosotros, te pedimos *reconfirmar* tu asistencia para el *Domingo 11 de Octubre*.

Reconfírmala en un toque aquí 👇
{link}

¡Gracias de corazón!
Kevin & Daniela 🤍`,
  },

  hero: {
    title: '¡Nos Casamos!',
    saveTheDate: '11 de Octubre de 2026',
  },

  story: [
    {
      title: 'Nuestra Historia',
      text: 'Dios cruzó nuestros caminos en el momento perfecto. Lo que comenzó con una amistad fue creciendo poco a poco hasta convertirse en una relación basada en el amor, el respeto y la fe. Cada experiencia vivida fortaleció nuestra decisión de caminar juntos.',
      image: '/gallery/Propuesta1.jpg',
    },
    {
      title: 'Nuestro "Sí"',
      text: 'Después de muchas oraciones, aprendizajes y sueños compartidos, entendimos que Dios nos estaba guiando hacia un mismo propósito. Hoy, con inmensa alegría, queremos celebrar junto a nuestra familia y amigos el inicio de esta nueva etapa que Él ha preparado para nosotros.',
      // Pendiente: foto real de la propuesta de matrimonio (Kevin la agregará pronto).
    },
  ],

  // Ceremonia y recepción en el mismo lugar (coordenadas reales de Kamaura).
  venues: [
    {
      label: 'Ceremonia y Recepción',
      name: 'Casa campestre Kamaura',
      address: 'Cl. 10, El Cerrito, Valle del Cauca',
      lat: 3.6871768,
      lng: -76.3111296,
      mapsUrl:
        'https://www.google.com/maps/dir/?api=1&destination=Kamaura%2C+Cl.+10%2C+El+Cerrito%2C+Valle+del+Cauca',
    },
  ],

  itinerary: [
    {
      time: '03:00 PM',
      title: 'Recepción de Invitados',
      description:
        'Te esperamos para compartir juntos este día tan especial. Valoramos mucho tu puntualidad.',
    },
    {
      time: '03:45 PM',
      title: 'Ceremonia',
      description: 'Celebraremos nuestro pacto matrimonial delante de Dios y de nuestros seres queridos.',
    },
    {
      time: '05:00 PM',
      title: 'Sesión de Fotografías',
      description: 'Un momento para compartir y capturar recuerdos inolvidables.',
    },
    {
      time: '05:30 PM',
      title: 'Brindis',
      description: 'Alzaremos nuestras copas para celebrar juntos el comienzo de esta nueva etapa.',
    },
    {
      time: '06:00 PM',
      title: 'Cena',
      description: 'Disfrutaremos de una deliciosa cena en compañía de todos nuestros invitados.',
    },
    {
      time: '07:00 PM',
      title: 'Celebración',
      description: 'Compartiremos un tiempo de alegría, música y momentos inolvidables.',
    },
    {
      time: '10:00 PM',
      title: 'Despedida',
      description: 'Gracias por ser parte de este día que recordaremos para siempre.',
    },
  ],

  dressCode: {
    title: 'Código de Vestimenta',
    level: 'Formal',
    description: 'Por favor, evita los colores blanco y sus derivados.',
  },

  // Música de fondo: coloca tu archivo en public/music/ y pon aquí su ruta.
  // Arranca en el primer toque (abrir el sobre). Comenta este bloque para desactivarla.
  music: {
    src: '/music/Mi Vida Sin Ti.mp3',
    title: 'Nuestra canción',
  },

  gifts: {
    title: 'Lluvia de sobres',
    description:
      'Tu presencia es nuestro mayor regalo. Si además deseas tener un detalle con nosotros, hemos preparado una lluvia de sobres: durante la recepción encontrarás un buzón donde podrás depositar tu sobre. Nos ayudará a comenzar juntos esta nueva etapa. ¡Gracias de corazón!',
  },

  farewell: {
    title: 'Gracias por Acompañarnos',
    message:
      'El mejor regalo será contar con tu presencia en este día tan especial. Gracias por acompañarnos, por tus oraciones y por celebrar con nosotros el comienzo de esta nueva etapa que Dios ha preparado para nuestras vidas.',
  },
}

/**
 * Derivados que usan varias pantallas. Se calculan una vez aquí para que
 * "Kevin & Daniela" no quede escrito a mano en media docena de archivos.
 */
export const coupleNames = `${wedding.couple.groomFirstName} & ${wedding.couple.brideFirstName}`

/** Título del sitio y nombre que aparece al compartir. */
export const siteName = coupleNames

/**
 * Medianoche del día del evento, conservando la zona horaria de `date`.
 * La usan el cálculo de la ventana de reconfirmación y su vista previa.
 */
export const weddingDayStart = wedding.date.replace(/T\d{2}:\d{2}:\d{2}/, 'T00:00:00')
