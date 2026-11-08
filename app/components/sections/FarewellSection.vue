<script setup lang="ts">
import type { WeddingConfig } from '~~/shared/types/wedding'
import { useReducedMotion } from '~/composables/useReducedMotion'

defineProps<{ farewell: WeddingConfig['farewell']; monogram: string }>()

const { prefersReduced } = useReducedMotion()

const COLORS = ['#dca9a7', '#c9a961', '#eed2d0', '#8f3f44']
const petals = Array.from({ length: 16 }, () => ({
  left: Math.random() * 100,
  size: 10 + Math.random() * 12,
  duration: 8 + Math.random() * 7,
  delay: -Math.random() * 15,
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
}))
</script>

<template>
  <section class="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
    <!-- Pétalos cayendo (ambiente) -->
    <div v-if="!prefersReduced" class="pointer-events-none absolute inset-0" aria-hidden="true">
      <span
        v-for="(p, i) in petals"
        :key="i"
        class="petal"
        :style="{
          left: p.left + '%',
          width: p.size + 'px',
          height: p.size + 'px',
          background: p.color,
          animationDuration: p.duration + 's',
          animationDelay: p.delay + 's',
        }"
      />
    </div>

    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_45%,rgba(143,63,68,0.10),transparent_70%)]"
    />

    <BotanicalSprig
      aria-hidden="true"
      class="pointer-events-none absolute left-2 top-8 w-16 -rotate-[20deg] opacity-60 sm:left-10 sm:w-24"
    />
    <BotanicalSprig
      aria-hidden="true"
      class="pointer-events-none absolute right-2 top-8 w-16 rotate-[20deg] opacity-60 sm:right-10 sm:w-24"
    />

    <AppReveal class="relative">
      <p class="font-display text-5xl font-light text-primary sm:text-6xl">{{ monogram }}</p>
      <OrnamentDivider class="mx-auto my-8" />
      <h2 class="font-display text-4xl font-light text-ink sm:text-5xl">{{ farewell.title }}</h2>
      <p class="mx-auto mt-6 max-w-md text-balance leading-relaxed text-ink-soft">
        {{ farewell.message }}
      </p>
      <p class="mt-10 text-xs uppercase tracking-[0.4em] text-ink-soft/50">
        Con amor, {{ monogram }}
      </p>
    </AppReveal>
  </section>
</template>

<style scoped>
.petal {
  position: absolute;
  top: 0;
  border-radius: 100% 0 100% 0;
  opacity: 0.7;
  will-change: transform, opacity;
  animation-name: petalFall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes petalFall {
  0% {
    transform: translateY(-12vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.75;
  }
  50% {
    transform: translateY(45vh) translateX(24px) rotate(180deg);
  }
  90% {
    opacity: 0.75;
  }
  100% {
    transform: translateY(112vh) translateX(-12px) rotate(360deg);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .petal {
    display: none;
  }
}
</style>
