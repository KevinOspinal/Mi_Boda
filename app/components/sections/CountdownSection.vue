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
  <section class="px-6 py-24 text-center">
    <AppReveal>
      <p class="text-[0.7rem] uppercase tracking-[0.5em] text-primary/70">{{ saveTheDate }}</p>
      <OrnamentDivider class="mx-auto mt-5" />
    </AppReveal>

    <AppReveal :delay="0.1">
      <p v-if="isPast" class="mt-10 font-display text-4xl italic text-primary">
        ¡Hoy es el gran día!
      </p>
      <div v-else class="mx-auto mt-12 flex max-w-md items-start justify-center">
        <template v-for="(u, i) in units" :key="u.label">
          <span
            v-if="i > 0"
            class="self-center pb-6 font-display text-3xl font-light text-primary/40 sm:text-4xl"
            aria-hidden="true"
            >:</span
          >
          <div class="flex flex-1 flex-col items-center">
            <span
              class="font-display text-5xl font-light tabular-nums text-ink sm:text-6xl"
              aria-hidden="true"
            >
              {{ pad(u.value) }}
            </span>
            <span class="mt-3 text-[0.6rem] uppercase tracking-[0.25em] text-ink-soft/60">
              {{ u.label }}
            </span>
          </div>
        </template>
      </div>
    </AppReveal>
  </section>
</template>
