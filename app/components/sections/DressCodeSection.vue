<script setup lang="ts">
import type { WeddingConfig } from '~~/shared/types/wedding'

defineProps<{ dressCode: WeddingConfig['dressCode'] }>()
</script>

<template>
  <section class="bg-surface-alt/40 px-6 py-24 text-center">
    <AppReveal>
      <SectionHeading :title="dressCode.title" kicker="Etiqueta" />
    </AppReveal>

    <AppReveal :delay="0.1">
      <!-- Iconografía simple traje + vestido -->
      <div class="mt-10 flex items-end justify-center gap-8 text-primary/70" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="h-14 w-14" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M8 3l4 3 4-3v18H8z" />
          <path d="M12 6v15M9 9l-3 2v10M15 9l3 2v10" />
        </svg>
        <svg viewBox="0 0 24 24" class="h-16 w-16" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M9 3h6l-1 5 3 13H7l3-13z" />
          <path d="M9 8h6" />
        </svg>
      </div>
    </AppReveal>

    <AppReveal :delay="0.15">
      <p class="mx-auto mt-8 max-w-sm text-balance leading-relaxed text-ink-soft">
        {{ dressCode.description }}
      </p>

      <div v-if="dressCode.palette?.length" class="mt-6 flex justify-center gap-3">
        <span
          v-for="c in dressCode.palette"
          :key="c"
          class="h-7 w-7 rounded-full border border-line"
          :style="{ backgroundColor: c }"
          aria-hidden="true"
        />
      </div>
    </AppReveal>
  </section>
</template>
