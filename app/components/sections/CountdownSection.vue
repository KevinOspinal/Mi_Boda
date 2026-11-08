<script setup lang="ts">
import { useCountdown } from '~/composables/useCountdown'

const props = defineProps<{ date: string; saveTheDate: string }>()
const { days, hours, minutes, seconds, isPast } = useCountdown(props.date)

const units = computed(() => [
  { label: 'Días', value: days.value },
  { label: 'Horas', value: hours.value },
  { label: 'Min', value: minutes.value },
  { label: 'Seg', value: seconds.value },
])

const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <section class="night-band relative overflow-hidden bg-night px-6 py-28 text-center">
    <!-- Luz tenue, como un salón de noche -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(201,169,97,0.13),transparent_65%)]"
    />

    <AppReveal class="relative">
      <p class="text-[0.7rem] uppercase tracking-[0.5em] text-gold-300">{{ saveTheDate }}</p>
      <OrnamentDivider class="mx-auto mt-5" tone="night" />
    </AppReveal>

    <AppReveal :delay="0.1" class="relative">
      <p v-if="isPast" class="mt-10 font-display text-4xl italic text-gold-300">
        ¡Hoy es el gran día!
      </p>
      <div v-else class="mx-auto mt-12 flex max-w-md items-start justify-center">
        <template v-for="(u, i) in units" :key="u.label">
          <span
            v-if="i > 0"
            class="self-center pb-6 font-display text-3xl font-light text-gold-300/40 sm:text-4xl"
            aria-hidden="true"
            >:</span
          >
          <div class="flex flex-1 flex-col items-center">
            <span
              class="font-display text-5xl font-light tabular-nums text-on-night sm:text-6xl"
              aria-hidden="true"
            >
              {{ pad(u.value) }}
            </span>
            <span class="mt-3 text-[0.6rem] uppercase tracking-[0.25em] text-on-night-soft/70">
              {{ u.label }}
            </span>
          </div>
        </template>
      </div>
    </AppReveal>
  </section>
</template>

<style scoped>
/* Dos filetes de oro que rematan la banda por dentro: el corte del marfil a
   la noche deja de ser un tajo y pasa a leerse como una cinta. */
.night-band::before,
.night-band::after {
  content: '';
  position: absolute;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgb(226 203 144 / 0.34), transparent);
  pointer-events: none;
}

.night-band::before {
  top: 1.15rem;
}

.night-band::after {
  bottom: 1.15rem;
}
</style>
