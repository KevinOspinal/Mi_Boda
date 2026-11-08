<script setup lang="ts">
import { wedding, coupleNames } from '~/config/wedding'
// Página de validación del sistema de diseño (uso interno durante el desarrollo).
useHead({ title: `Styleguide · ${coupleNames}` })

const colors = [
  { name: 'white', value: '#ffffff' },
  { name: 'surface', value: '#fdf9f6' },
  { name: 'surface-alt', value: '#f8eeea' },
  { name: 'primary', value: '#8f3f44' },
  { name: 'primary-soft', value: '#bb7472' },
  { name: 'ink', value: '#32211f' },
  { name: 'ink-soft', value: '#7b6360' },
  { name: 'line', value: '#eedfda' },
  { name: 'gold-400', value: '#c9a961' },
  { name: 'paper-200', value: '#f2e9dd' },
]

const musicActive = ref(false)

// Datos de ejemplo para el componente de mesa (Fase 4)
const lock = (nombre: string) => ({ orden: 0, nombre: null, revealed: false, propio: false, siempreVisible: false, _n: nombre })
const mesaHonor = {
  id: 1,
  nombre: 'Mesa de Honor',
  esHonor: true,
  capacidad: 10,
  seats: [
    { orden: 1, nombre: wedding.couple.groomFirstName, revealed: true, propio: false, siempreVisible: true },
    { orden: 2, nombre: wedding.couple.brideFirstName, revealed: true, propio: false, siempreVisible: true },
    { orden: 3, nombre: 'Pastor', revealed: true, propio: false, siempreVisible: true },
    { orden: 4, nombre: 'Gloria', revealed: true, propio: true, siempreVisible: false },
    lock('Leidy'), lock('Jonnathan'), lock('Emily'), lock('Jonny'), lock('Maria'),
  ],
}
const mesa2 = {
  id: 2,
  nombre: 'Mesa 2',
  esHonor: false,
  capacidad: 10,
  seats: [
    { orden: 1, nombre: 'Andres', revealed: true, propio: true, siempreVisible: false },
    { orden: 2, nombre: 'Claudia', revealed: true, propio: true, siempreVisible: false },
    { orden: 3, nombre: 'Brayan', revealed: true, propio: true, siempreVisible: false },
    lock('a'), lock('b'), lock('c'), lock('d'), lock('e'),
  ],
}
</script>

<template>
  <main id="contenido" class="mx-auto max-w-3xl px-6 py-20">
    <SectionHeading kicker="Fase 1" title="Sistema de Diseño" />

    <!-- Tipografía -->
    <section class="mt-16 space-y-6">
      <h3 class="text-xs uppercase tracking-[0.3em] text-ink-soft">Tipografía</h3>
      <p class="font-display text-6xl font-light text-ink">Cormorant Garamond</p>
      <p class="font-display text-3xl font-light italic text-primary">El día más especial</p>
      <p class="font-sans text-base text-ink-soft">
        Inter — texto de interfaz, legible y neutro para acompañar la serif editorial.
      </p>
    </section>

    <!-- Paleta -->
    <section class="mt-16">
      <h3 class="mb-6 text-xs uppercase tracking-[0.3em] text-ink-soft">Paleta</h3>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div v-for="c in colors" :key="c.name" class="space-y-2">
          <div
            class="h-16 rounded-lg border border-line"
            :style="{ backgroundColor: c.value }"
          />
          <p class="text-xs text-ink-soft">{{ c.name }}</p>
        </div>
      </div>
    </section>

    <!-- Botones -->
    <section class="mt-16">
      <h3 class="mb-6 text-xs uppercase tracking-[0.3em] text-ink-soft">Botones</h3>
      <div class="flex flex-wrap items-center gap-4">
        <AppButton variant="primary">Confirmar</AppButton>
        <AppButton variant="outline">Ver más</AppButton>
        <AppButton variant="ghost">Cancelar</AppButton>
      </div>
    </section>

    <!-- Control de música -->
    <section class="mt-16">
      <h3 class="mb-6 text-xs uppercase tracking-[0.3em] text-ink-soft">Control de música</h3>
      <MusicToggle :active="musicActive" @toggle="musicActive = !musicActive" />
    </section>

    <!-- Reveal por scroll -->
    <section class="mt-16">
      <h3 class="mb-6 text-xs uppercase tracking-[0.3em] text-ink-soft">
        Reveal por scroll (baja para verlo)
      </h3>
      <div class="space-y-24 py-24">
        <AppReveal v-for="n in 3" :key="n">
          <div class="rounded-xl border border-primary/20 bg-surface-alt/40 p-10 text-center">
            <p class="font-display text-2xl text-ink">Bloque {{ n }}</p>
            <p class="mt-2 text-sm text-ink-soft">Aparece con elegancia al entrar en pantalla.</p>
          </div>
        </AppReveal>
      </div>
    </section>
    <!-- Mesa (Fase 4) -->
    <section class="mt-16">
      <h3 class="mb-8 text-xs uppercase tracking-[0.3em] text-ink-soft">Mesa — vista del invitado</h3>
      <div class="space-y-16">
        <MesaReveal :mesa="mesaHonor" />
        <MesaReveal :mesa="mesa2" />
      </div>
    </section>
  </main>
</template>
