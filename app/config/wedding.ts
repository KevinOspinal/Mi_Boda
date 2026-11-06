// Ruta relativa a propósito: este archivo también lo lee nuxt.config.ts, que se
// carga antes de que existan los alias (~~/), y ahí un alias no resolvería.
import type { WeddingConfig } from '../../shared/types/wedding'

export const wedding: WeddingConfig = {
  couple: {
    brideFirstName: 'Yisell',
    groomFirstName: 'Carlos',
    monogram: 'C&Y',
    // Nombres que van resaltados como "los novios" en el plano de mesas.
    honorSeatNames: ['Carlos', 'Yisell'],
  },

  date: '2026-12-19T18:00:00-05:00',
  timezone: 'America/Bogota',
  dateLabel: 'Sábado 19 de Diciembre de 2026',

  // Lo que se ve al compartir el enlace por WhatsApp o redes.
  seo: {
    tagline: '19 de Diciembre de 2026 · Casa Finca Doña Glads, Pradera, Valle.',
    ogImage: '/og/invitation.jpg',
    demoCode: 'carlos',
  },

  // Mensajes de WhatsApp. {name} = nombre del invitado · {link} = su enlace.
  messages: {
    invite: `✨ *Carlos & Yisell se casan* ✨

Hola {name}, con el corazón lleno de alegría queremos invitarte a celebrar nuestra boda 💍

🗓️ Sábado 19 de Diciembre de 2026
📍 Casa Finca Doña Glads · Pradera, Valle

Toca tu invitación personal para ver todos los detalles y confirmar tu asistencia 👇
{link}

Con cariño,
Carlos & Yisell 🤍`,

    reconfirm: `Hola {name} 💍 ¡Ya casi es el gran día!

Como cada lugar en la boda es muy especial para nosotros, te pedimos *reconfirmar* tu asistencia para el *Sábado 19 de Diciembre*.

Reconfírmala en un toque aquí 👇
{link}

¡Gracias de corazón!
Carlos & Yisell 🤍`,
  },

  hero: {
    title: '¡Nos Casamos!',
    saveTheDate: '19 de Diciembre de 2026',
  },

  // Sin fotos: los bloques se muestran centrados a una sola columna.
  // Si más adelante llega una foto, basta con añadir `image: '/gallery/…'`.
  story: [
    {
      title: 'Nuestra Historia',
      text: 'Nuestros caminos se cruzaron para escribir juntos una historia que ninguno de los dos imaginaba. Lo que comenzó como un encuentro se fue convirtiendo en compañía, en confianza y en un amor que creció con el tiempo y con la fe. Hoy, de la mano de Dios, decidimos unir nuestras vidas y prometernos amor, respeto y fidelidad para todos los días que vengan.',
    },
    {
      title: 'Un Sí Bendecido por Dios',
      text: 'Al mirar atrás entendemos que Dios estuvo en cada paso: en los encuentros, en la espera y en cada decisión que nos trajo hasta aquí. Él llegó a cambiarlo todo, y por eso este sí no lo decimos solos. Queremos celebrarlo rodeados de las personas que amamos, dando gracias por lo que Él ya hizo y por todo lo que apenas comienza.',
    },
  ],

  venues: [
    {
      label: 'Ceremonia y Recepción',
      name: 'Casa Finca Doña Glads',
      address: 'Calle 5, Pradera, Valle del Cauca',
      lat: 3.4153131,
      lng: -76.2324868,
      // Por coordenadas a propósito: una finca rural no siempre aparece en
      // Google Maps por su nombre, y las coordenadas sí llevan al punto exacto.
      mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=3.4153131%2C-76.2324868',
    },
  ],

  itinerary: [
    {
      time: '04:30 PM',
      title: 'Recepción de Invitados',
      description:
        'Te esperamos para compartir juntos este día tan especial. Valoramos mucho tu puntualidad.',
    },
    {
      time: '06:00 PM',
      title: 'Ceremonia',
      description: 'Celebraremos nuestro pacto matrimonial delante de Dios y de nuestros seres queridos.',
    },
    {
      time: '07:00 PM',
      title: 'Sesión de Fotografías',
      description: 'Un momento para compartir y capturar recuerdos inolvidables.',
    },
    {
      time: '08:00 PM',
      title: 'Brindis',
      description: 'Alzaremos nuestras copas para celebrar juntos el comienzo de esta nueva etapa.',
    },
    {
      time: '08:30 PM',
      title: 'Celebración',
      description: 'Compartiremos un tiempo de alegría, música y momentos inolvidables.',
    },
    {
      time: '09:00 PM',
      title: 'Cena',
      description: 'Disfrutaremos de una deliciosa cena en compañía de todos nuestros invitados.',
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

  // Música de fondo: coloca el archivo en public/music/ y pon aquí su ruta.
  // Desactivada hasta que los novios elijan su canción.
  // music: {
  //   src: '/music/cancion.mp3',
  //   title: 'Nuestra canción',
  // },

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
 * "Carlos & Yisell" no quede escrito a mano en media docena de archivos.
 */
export const coupleNames = `${wedding.couple.groomFirstName} & ${wedding.couple.brideFirstName}`

/** Título del sitio y nombre que aparece al compartir. */
export const siteName = coupleNames

/**
 * Medianoche del día del evento, conservando la zona horaria de `date`.
 * La usan el cálculo de la ventana de reconfirmación y su vista previa.
 */
export const weddingDayStart = wedding.date.replace(/T\d{2}:\d{2}:\d{2}/, 'T00:00:00')
