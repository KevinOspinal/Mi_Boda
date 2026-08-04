import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/image', '@pinia/nuxt'],

  // Nombres de componente sin prefijo de carpeta (ui/AppButton.vue -> <AppButton>).
  components: [{ path: '~/components', pathPrefix: false }],

  css: ['~/assets/css/main.css'],

  // Auto-hospeda las fuentes (sin peticiones externas en runtime).
  fonts: {
    // Detecta familias usadas a través de variables CSS (nuestros tokens @theme).
    experimental: { processCSSVariables: true },
    families: [
      {
        name: 'Cormorant Garamond',
        provider: 'google',
        weights: [300, 400, 500, 600],
        styles: ['normal', 'italic'],
      },
      { name: 'Inter', provider: 'google', weights: [300, 400, 500, 600] },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
    // Permite ver el dev server a través de túneles (cloudflared/localtunnel) al compartir.
    server: {
      allowedHosts: ['.trycloudflare.com', '.loca.lt'],
    },
  },

  // Server-only secrets (never exposed to the client). Populated from env:
  //   NUXT_DATABASE_URL, NUXT_ADMIN_PASSWORD, NUXT_ADMIN_SESSION_PASSWORD
  runtimeConfig: {
    databaseUrl: '',
    // Panel de administración (Kevin & Daniela).
    adminPassword: '', // NUXT_ADMIN_PASSWORD — clave compartida para entrar al panel.
    adminSessionPassword: '', // NUXT_ADMIN_SESSION_PASSWORD — secreto (>=32 chars) que sella la cookie.
    public: {
      siteUrl: 'http://localhost:3000',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Kevin & Daniela — Nuestra Boda',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#10192f' },
        {
          name: 'description',
          content: 'Nos casamos. Te esperamos para celebrar este día tan especial.',
        },
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // se corre aparte con `npm run typecheck` (más rápido en dev)
  },
})
