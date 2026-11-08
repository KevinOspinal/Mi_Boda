<script setup lang="ts">
import { wedding, coupleNames } from '~/config/wedding'
definePageMeta({ layout: 'default' })
useHead({
  title: `Panel · ${coupleNames}`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const { submitting, errorMsg, login } = useAdminAuth()
const password = ref('')
const showPassword = ref(false)

function onSubmit() {
  if (!password.value || submitting.value) return
  login(password.value)
}
</script>

<template>
  <main class="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-12">
    <!-- Halo suave de fondo -->
    <div
      class="pointer-events-none absolute -top-40 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
      style="background: radial-gradient(circle, var(--color-olive-100), transparent 70%)"
      aria-hidden="true"
    />

    <section
      class="relative w-full max-w-md rounded-[1.75rem] border border-line bg-white/80 px-8 py-12 shadow-[0_30px_80px_-40px_rgba(42,24,22,0.35)] backdrop-blur-sm sm:px-11"
    >
      <!-- Sprigs decorativos en esquinas -->
      <BotanicalSprig class="pointer-events-none absolute -left-3 -top-6 w-12 rotate-[18deg] opacity-70" />
      <BotanicalSprig class="pointer-events-none absolute -right-3 -top-6 w-12 -rotate-[18deg] opacity-70" />

      <header class="text-center">
        <p class="mb-4 text-[0.68rem] uppercase tracking-[0.45em] text-primary">Administración</p>
        <h1 class="font-display text-4xl font-light leading-tight text-ink sm:text-[2.75rem]">
          {{ wedding.couple.groomFirstName }}
          <span class="text-primary italic">&amp;</span>
          {{ wedding.couple.brideFirstName }}
        </h1>
        <OrnamentDivider class="mx-auto mt-5" />
        <p class="mt-5 text-sm leading-relaxed text-ink-soft">
          Espacio privado de los novios.<br >Ingresa la clave para administrar las invitaciones.
        </p>
      </header>

      <form class="mt-9 space-y-5" @submit.prevent="onSubmit">
        <div>
          <label for="admin-password" class="mb-2 block text-[0.7rem] uppercase tracking-[0.3em] text-ink-soft">
            Clave de acceso
          </label>
          <div class="relative">
            <input
              id="admin-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              autofocus
              placeholder="••••••••"
              class="w-full rounded-full border border-line bg-surface/60 px-5 py-3.5 pr-14 text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-primary/70 focus:bg-white"
            >
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-ink-soft transition-colors hover:text-primary"
              :aria-label="showPassword ? 'Ocultar clave' : 'Mostrar clave'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.4 5.2A9.6 9.6 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4M6.2 6.2A17 17 0 002 12s3.5 7 10 7a9.5 9.5 0 003.4-.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <transition
          enter-active-class="transition duration-300"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <p v-if="errorMsg" class="flex items-center gap-2 text-sm text-red-700/90" role="alert">
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4.5M12 16h.01" stroke-linecap="round" />
            </svg>
            {{ errorMsg }}
          </p>
        </transition>

        <AppButton tag="button" variant="primary" :disabled="submitting || !password" class="w-full">
          <svg v-if="submitting" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" opacity="0.25" />
            <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          </svg>
          {{ submitting ? 'Entrando…' : 'Entrar al panel' }}
        </AppButton>
      </form>

      <NuxtLink
        to="/"
        class="mt-8 flex items-center justify-center gap-1.5 text-[0.72rem] uppercase tracking-[0.25em] text-ink-soft transition-colors hover:text-primary"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Volver a la invitación
      </NuxtLink>
    </section>
  </main>
</template>
