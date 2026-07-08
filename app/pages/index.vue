<script setup lang="ts">
import { wedding } from '~/config/wedding'

// Landing genérica / demo. La experiencia real y personalizada vive en /invite/:code.
const { couple } = wedding
</script>

<template>
  <main
    id="contenido"
    class="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center"
  >
    <!-- Halo de luz suave de fondo -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_35%,rgba(212,106,136,0.14),transparent_70%)]"
    />

    <p class="mb-6 text-sm uppercase tracking-[0.4em] text-ink-soft/70">
      {{ wedding.hero.saveTheDate }}
    </p>

    <h1 class="font-display text-6xl font-light leading-none text-ink sm:text-8xl">
      {{ couple.groomFirstName }}
      <span class="mx-2 block text-2xl italic text-primary sm:inline sm:text-4xl">&amp;</span>
      {{ couple.brideFirstName }}
    </h1>

    <div class="mt-8 h-px w-24 bg-primary/50" />

    <p class="mt-8 max-w-md text-balance text-ink-soft/80">
      Estás a punto de vivir una invitación como ninguna otra. Cada invitado tiene su propio
      enlace personal.
    </p>

    <NuxtLink
      to="/invite/kevin"
      class="mt-10 inline-flex items-center gap-2 rounded-full border border-primary/60 px-8 py-3 text-sm uppercase tracking-widest text-primary transition hover:bg-primary hover:text-white"
    >
      Ver invitación demo
    </NuxtLink>

    <p class="absolute bottom-6 text-xs uppercase tracking-[0.3em] text-ink-soft/40">
      Fase 0 · Cimientos
    </p>
  </main>
</template>
