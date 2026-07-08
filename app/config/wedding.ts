import type { WeddingConfig } from '~~/shared/types/wedding'

export const wedding: WeddingConfig = {
  couple: {
    brideFirstName: 'Daniela',
    groomFirstName: 'Kevin',
    monogram: 'K&D',
  },

  date: '2026-10-11T16:00:00-05:00',
  timezone: 'America/Bogota',

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

  // Las rutas de /public se sirven desde la raíz (sin "../../public").
  gallery: ['/gallery/Propuesta1.jpg', '/gallery/Propuesta2.JPG'],

  // Ceremonia y recepción en el mismo lugar (coordenadas reales de Kamaura).
  venues: [
    {
      label: 'Ceremonia y Recepción',
      name: 'Kamaura',
      address: 'Cl. 10, El Cerrito, Valle del Cauca',
      lat: 3.6871768,
      lng: -76.3111296,
      mapsUrl:
        'https://www.google.com/maps/dir/?api=1&destination=Kamaura%2C+Cl.+10%2C+El+Cerrito%2C+Valle+del+Cauca',
    },
  ],

  itinerary: [
    {
      time: '04:00 PM',
      title: 'Recepción de Invitados',
      description: 'Te esperamos para compartir juntos este día tan especial.',
    },
    {
      time: '04:30 PM',
      title: 'Ceremonia',
      description: 'Celebraremos nuestro pacto matrimonial delante de Dios y de nuestros seres queridos.',
    },
    {
      time: '05:30 PM',
      title: 'Sesión de Fotografías',
      description: 'Un momento para compartir y capturar recuerdos inolvidables.',
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
      time: '9:00 PM',
      title: 'Despedida',
      description: 'Gracias por ser parte de este día que recordaremos para siempre.',
    },
  ],

  dressCode: {
    title: 'Código de Vestimenta',
    description:
      'Vestimenta formal. Queremos que nos acompañes luciendo elegante para celebrar juntos este día tan especial.',

    palette: [
      '#4a2b36',
      '#d46a88',
      '#efe7d6',
    ],
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