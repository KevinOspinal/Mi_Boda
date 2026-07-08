<script setup lang="ts">
import type { WeddingConfig } from '~~/shared/types/wedding'

defineProps<{ gifts: NonNullable<WeddingConfig['gifts']> }>()
</script>

<template>
  <section class="px-6 py-24 text-center">
    <AppReveal>
      <SectionHeading kicker="Un detalle" :title="gifts.title" />
    </AppReveal>

    <AppReveal :delay="0.1">
      <!-- Sobre con corazón (lluvia de sobres) -->
      <div class="mt-10 flex justify-center text-primary/70" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="h-16 w-16" fill="none" stroke="currentColor" stroke-width="1">
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 8l9 6 9-6" />
          <path
            d="M12 12.5l-.9-.85a1.1 1.1 0 0 1 1.55-1.55l.35.35.35-.35a1.1 1.1 0 0 1 1.55 1.55L12 14z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      </div>
    </AppReveal>

    <AppReveal :delay="0.15">
      <p class="mx-auto mt-8 max-w-md text-balance leading-relaxed text-ink-soft">
        {{ gifts.description }}
      </p>

      <a
        v-if="gifts.url"
        :href="gifts.url"
        target="_blank"
        rel="noopener"
        class="mt-8 inline-block"
      >
        <AppButton tag="span" variant="outline">Mesa de regalos</AppButton>
      </a>
    </AppReveal>
  </section>
</template>
