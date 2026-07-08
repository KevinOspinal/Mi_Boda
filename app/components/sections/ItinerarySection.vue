<script setup lang="ts">
import type { ItineraryItem } from '~~/shared/types/wedding'

defineProps<{ items: ItineraryItem[] }>()
</script>

<template>
  <section class="px-6 py-24">
    <AppReveal>
      <SectionHeading kicker="El día" title="Itinerario" />
    </AppReveal>

    <ol class="mx-auto mt-14 max-w-md">
      <AppReveal v-for="(item, i) in items" :key="i" :delay="i * 0.06">
        <li class="relative flex gap-6 pb-10 last:pb-0">
          <!-- Línea + punto -->
          <div class="flex flex-col items-center">
            <span class="mt-1 h-3 w-3 rounded-full bg-primary" aria-hidden="true" />
            <span
              v-if="i < items.length - 1"
              class="mt-1 w-px flex-1 bg-line"
              aria-hidden="true"
            />
          </div>
          <div class="pb-2">
            <p class="font-display text-xl text-primary">{{ item.time }}</p>
            <h3 class="mt-1 text-sm font-medium uppercase tracking-[0.2em] text-ink">
              {{ item.title }}
            </h3>
            <p v-if="item.description" class="mt-1 text-sm text-ink-soft">
              {{ item.description }}
            </p>
          </div>
        </li>
      </AppReveal>
    </ol>
  </section>
</template>
