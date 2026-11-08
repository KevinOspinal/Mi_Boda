<script setup lang="ts">
import type { WeddingConfig } from '~~/shared/types/wedding'
import { useReducedMotion } from '~/composables/useReducedMotion'

defineProps<{ farewell: WeddingConfig['farewell']; monogram: string }>()

const { prefersReduced } = useReducedMotion()

// Pétalos claros: sobre el fondo oscuro, el vino no se vería.
const COLORS = ['#e8c6c2', '#e2cb90', '#f3ded9', '#c99a94']
const petals = Array.from({ length: 16 }, () => ({
  left: Math.random() * 100,
  size: 10 + Math.random() * 12,
  duration: 8 + Math.random() * 7,
  delay: -Math.random() * 15,
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
}))
</script>

<template>
  <section
    class="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-night px-6 text-center"
  >
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
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(201,169,97,0.12),transparent_68%)]"
    />

    <!-- Mismo filete que la portada: la invitación abre y cierra enmarcada. -->
    <div aria-hidden="true" class="night-frame">
      <span /><span /><span /><span />
    </div>

    <BotanicalSprig
      tone="night"
      aria-hidden="true"
      class="pointer-events-none absolute left-2 top-16 w-16 -rotate-[20deg] opacity-50 sm:left-12 sm:w-24"
    />
    <BotanicalSprig
      tone="night"
      aria-hidden="true"
      class="pointer-events-none absolute right-2 top-16 w-16 rotate-[20deg] opacity-50 sm:right-12 sm:w-24"
    />

    <AppReveal class="relative">
      <p class="font-display text-5xl font-light text-gold-300 sm:text-6xl">{{ monogram }}</p>
      <OrnamentDivider class="mx-auto my-8" tone="night" />
      <h2 class="font-display text-4xl font-light text-on-night sm:text-5xl">
        {{ farewell.title }}
      </h2>
      <p class="mx-auto mt-6 max-w-md text-balance leading-relaxed text-on-night-soft">
        {{ farewell.message }}
      </p>
      <p class="mt-10 text-xs uppercase tracking-[0.4em] text-on-night-soft">
        Con amor, {{ monogram }}
      </p>
    </AppReveal>
  </section>
</template>

<style scoped>
.night-frame {
  position: absolute;
  inset: 1.15rem;
  border: 1px solid rgb(226 203 144 / 0.26);
  pointer-events: none;
}

.night-frame span {
  position: absolute;
  width: 6px;
  height: 6px;
  rotate: 45deg;
  background: var(--color-gold-400);
}

.night-frame span:nth-child(1) {
  top: -3.5px;
  left: -3.5px;
}

.night-frame span:nth-child(2) {
  top: -3.5px;
  right: -3.5px;
}

.night-frame span:nth-child(3) {
  bottom: -3.5px;
  left: -3.5px;
}

.night-frame span:nth-child(4) {
  bottom: -3.5px;
  right: -3.5px;
}

@media (min-width: 640px) {
  .night-frame {
    inset: 1.85rem;
  }
}

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
