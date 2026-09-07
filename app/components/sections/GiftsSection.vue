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
          <!--
            Corazón simétrico respecto a x=12, el mismo eje del sobre.
            Dos semicírculos (r=1.15) arriba y dos curvas espejadas hacia la
            punta. Caja: x 9.7→14.3, y 10.35→14.65, o sea centro (12, 12.5),
            que coincide con el centro del rect del sobre (y 6→19).
          -->
          <path
            d="M12 14.65C11.1 13.7 9.7 12.55 9.7 11.5a1.15 1.15 0 0 1 2.3 0 1.15 1.15 0 0 1 2.3 0c0 1.05-1.4 2.2-2.3 3.15z"
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
