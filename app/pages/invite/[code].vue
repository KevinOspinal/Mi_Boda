<script setup lang="ts">
import type { InviteData } from '~~/shared/types/guest'
import { wedding } from '~/config/wedding'
import { useAudio } from '~/composables/useAudio'
import { useExperienceStore } from '~/stores/experience'

const route = useRoute()
const code = computed(() => String(route.params.code ?? ''))

// SSR: datos personalizados del invitado desde el BFF de Nuxt.
// `retry` reintenta ante fallos transitorios (p. ej. hipo momentáneo de red/BD).
const {
  data: guest,
  error,
  refresh,
  status,
} = await useFetch<InviteData>(() => `/api/invite/${code.value}`, {
  key: () => `invite-${code.value}`,
  retry: 2,
  retryDelay: 500,
})

const coupleNames = `${wedding.couple.groomFirstName} & ${wedding.couple.brideFirstName}`

// Flujo de la experiencia: sobre → (apertura) → bienvenida/contenido.
const opened = ref(false)

// Música de fondo. Arranca en la PRIMERA interacción (el toque para abrir el
// sobre) porque los navegadores bloquean el audio automático al cargar.
const audio = useAudio(() => wedding.music?.src)
const hasMusic = computed(() => Boolean(wedding.music?.src))
const store = useExperienceStore()

async function startMusic() {
  if (hasMusic.value) await audio.play()
}

// Al primer gesto del usuario (abrir el sobre) → suena la música.
watch(
  () => store.hasInteracted,
  (interacted) => {
    if (interacted) startMusic()
  },
)

async function onExperienceStart() {
  opened.value = true
  await startMusic() // respaldo por si se saltó la intro
}

// Meta OG (preview elegante al compartir por WhatsApp): tarjeta 1200x630.
const runtime = useRuntimeConfig()
const siteUrl = (runtime.public.siteUrl || 'http://localhost:3000').replace(/\/+$/, '')
const ogImage = `${siteUrl}/og/invitation.jpg`
const ogDesc = '11 de Octubre de 2026 · Kamaura, El Cerrito, Valle. Abre tu invitación y confirma tu asistencia. 💍'
useSeoMeta({
  title: () => (guest.value ? `${guest.value.displayName} · ${coupleNames}` : coupleNames),
  ogTitle: `${coupleNames} — Nos Casamos`,
  description: ogDesc,
  ogDescription: ogDesc,
  ogType: 'website',
  ogUrl: () => `${siteUrl}/invite/${code.value}`,
  ogImage,
  ogImageSecureUrl: ogImage,
  ogImageType: 'image/jpeg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Kevin & Daniela — 11 de Octubre de 2026',
  ogSiteName: 'Kevin & Daniela',
  ogLocale: 'es_CO',
  twitterCard: 'summary_large_image',
  twitterTitle: `${coupleNames} — Nos Casamos`,
  twitterDescription: ogDesc,
  twitterImage: ogImage,
})
</script>

<template>
  <div>
    <template v-if="guest">
      <!-- Escena cinematográfica: intro + sobre + apertura -->
      <EnvelopeScene
        v-if="!opened"
        :recipient="guest.displayName"
        :monogram="wedding.couple.monogram"
        :couple-names="coupleNames"
        @complete="onExperienceStart"
      />

      <!-- Experiencia posterior a la apertura -->
      <template v-else>
        <WelcomeHero :guest="guest" :couple-names="coupleNames" />
        <ReconfirmSection :guest="guest" />
        <CountdownSection :date="wedding.date" :save-the-date="wedding.hero.saveTheDate" />
        <StorySection :blocks="wedding.story" />
        <GallerySection :images="wedding.gallery" />
        <EventDetailsSection
          :date="wedding.date"
          :timezone="wedding.timezone"
          :venues="wedding.venues"
        />
        <ItinerarySection :items="wedding.itinerary" />
        <DressCodeSection :dress-code="wedding.dressCode" />
        <GiftsSection v-if="wedding.gifts" :gifts="wedding.gifts" />
        <MapSection :venues="wedding.venues" />
        <RsvpSection :guest="guest" :existing-rsvp="guest.rsvp" />
        <FarewellSection :farewell="wedding.farewell" :monogram="wedding.couple.monogram" />
      </template>

      <!-- Control de música flotante (aparece tras abrir) -->
      <div v-if="opened" class="fixed bottom-6 left-6 z-50">
        <MusicToggle
          :active="audio.isPlaying.value"
          :disabled="!hasMusic"
          @toggle="audio.toggle()"
        />
      </div>
    </template>

    <!-- Estados sin invitado -->
    <main
      v-else
      class="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center"
    >
      <template v-if="error?.statusCode === 404">
        <h1 class="font-display text-4xl font-light text-ink">Invitación no encontrada</h1>
        <p class="mt-4 max-w-sm text-ink-soft/70">
          No encontramos una invitación con este enlace. Verifica el link que te compartieron.
        </p>
      </template>

      <template v-else>
        <h1 class="font-display text-4xl font-light text-ink">Ups, algo salió mal</h1>
        <p class="mt-4 max-w-sm text-ink-soft/70">
          No pudimos cargar tu invitación en este momento. Vuelve a intentarlo.
        </p>
        <AppButton
          variant="outline"
          class="mt-8"
          :disabled="status === 'pending'"
          @click="refresh()"
        >
          {{ status === 'pending' ? 'Cargando…' : 'Reintentar' }}
        </AppButton>
      </template>

      <NuxtLink to="/" class="mt-6 text-sm uppercase tracking-widest text-primary hover:underline">
        Volver al inicio
      </NuxtLink>
    </main>
  </div>
</template>
