<script setup lang="ts">
import type { EventVenue } from '~~/shared/types/wedding'
import { formatLongDate, formatTime, capitalize } from '~/utils/date'

const props = defineProps<{ date: string; timezone: string; venues: EventVenue[] }>()

const longDate = computed(() => capitalize(formatLongDate(props.date, props.timezone)))
const time = computed(() => formatTime(props.date, props.timezone))
</script>

<template>
  <section class="bg-surface-alt px-6 py-24">
    <AppReveal>
      <SectionHeading kicker="El evento" title="Cuándo y dónde" />
    </AppReveal>

    <AppReveal :delay="0.1">
      <div class="mx-auto mt-12 max-w-md text-center">
        <p class="font-display text-2xl text-ink sm:text-3xl">{{ longDate }}</p>
        <p class="mt-2 text-sm uppercase tracking-[0.3em] text-primary">{{ time }}</p>
      </div>
    </AppReveal>

    <div
      class="mx-auto mt-14 grid gap-6"
      :class="venues.length > 1 ? 'max-w-2xl sm:grid-cols-2' : 'max-w-md'"
    >
      <AppReveal v-for="(v, i) in venues" :key="i" :delay="0.05 + i * 0.08">
        <div
          class="h-full rounded-xl border border-line bg-surface p-8 text-center shadow-[0_10px_30px_-18px_rgba(60,38,34,0.35)] transition duration-300 hover:-translate-y-1 hover:border-primary/40"
        >
          <p class="text-xs uppercase tracking-[0.3em] text-primary">{{ v.label }}</p>
          <h3 class="mt-3 font-display text-2xl text-ink">{{ v.name }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-ink-soft">{{ v.address }}</p>
        </div>
      </AppReveal>
    </div>
  </section>
</template>
