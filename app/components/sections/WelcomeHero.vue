<script setup lang="ts">
import type { Guest } from '~~/shared/types/guest'
import { EASE } from '~/utils/ease'

const props = defineProps<{ guest: Guest; coupleNames: string }>()

const isHonor = computed(() => (props.guest.groupLabel ?? '').toLowerCase().includes('honor'))

const { $gsap } = useNuxtApp()
const root = ref<HTMLElement>()
let ctx: ReturnType<typeof $gsap.context> | undefined

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const items = root.value?.querySelectorAll('[data-reveal]')
  if (!items) return
  if (reduce) {
    $gsap.set(items, { opacity: 1, y: 0 })
    return
  }
  ctx = $gsap.context(() => {
    $gsap.from(items, {
      opacity: 0,
      y: 24,
      duration: 1,
      ease: EASE.elegant,
      stagger: 0.14,
      delay: 0.1,
    })
  })
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section
    ref="root"
    class="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center"
  >
    <!-- Luz cálida al centro, oro abajo y viñeta en los bordes: el papel deja
         de ser un rectángulo plano y gana profundidad sin necesidad de foto. -->
    <div aria-hidden="true" class="hero-glow" />

    <!-- Filete de papelería: el marco que llevaría la tarjeta impresa. -->
    <div aria-hidden="true" class="hero-frame">
      <span /><span /><span /><span />
    </div>

    <!-- Acentos botánicos -->
    <BotanicalSprig
      aria-hidden="true"
      class="pointer-events-none absolute left-3 top-14 w-20 -rotate-12 opacity-70 sm:left-10 sm:w-28"
    />
    <BotanicalSprig
      aria-hidden="true"
      class="pointer-events-none absolute right-3 bottom-28 w-20 rotate-[168deg] opacity-70 sm:right-10 sm:w-28"
    />

    <p
      v-if="isHonor"
      data-reveal
      class="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-primary"
    >
      ✦ {{ guest.groupLabel }}
    </p>

    <p data-reveal class="mb-5 text-[0.7rem] uppercase tracking-[0.55em] text-primary/70">
      {{ guest.maxPasses > 1 ? 'Bienvenidos' : 'Bienvenido' }}
    </p>

    <h1 data-reveal class="font-display text-6xl font-light leading-none text-ink sm:text-7xl">
      {{ guest.displayName }}
    </h1>

    <OrnamentDivider data-reveal class="mx-auto my-8" />

    <p data-reveal class="font-display text-2xl italic text-primary sm:text-3xl">
      {{ coupleNames }}
    </p>

    <p data-reveal class="mt-6 max-w-sm text-balance leading-relaxed text-ink-soft/80">
      Con toda nuestra ilusión, te esperamos para celebrar este día tan especial.
    </p>

    <p
      data-reveal
      class="mt-5 inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-xs text-ink-soft/70"
    >
      <span class="text-primary">♥</span>
      {{ guest.maxPasses > 1 ? `${guest.maxPasses} pases reservados` : '1 pase reservado' }}
    </p>

    <div data-reveal class="absolute bottom-14 flex flex-col items-center gap-2">
      <span class="text-[0.65rem] uppercase tracking-[0.3em] text-ink-soft/50">Desliza</span>
      <span class="h-8 w-px animate-pulse bg-primary/40" aria-hidden="true" />
    </div>
  </section>
</template>

<style scoped>
.hero-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(58% 42% at 50% 30%, rgb(var(--rgb-primary) / 0.13), transparent 72%),
    radial-gradient(75% 45% at 50% 106%, rgb(var(--rgb-gold) / 0.16), transparent 72%),
    radial-gradient(120% 78% at 50% 50%, transparent 56%, rgb(var(--rgb-shadow) / 0.1) 100%);
}

.hero-frame {
  position: absolute;
  inset: 1.15rem;
  border: 1px solid rgb(var(--rgb-gold) / 0.38);
  pointer-events: none;
}

/* Rombos en las esquinas, montados sobre el filete. */
.hero-frame span {
  position: absolute;
  width: 6px;
  height: 6px;
  rotate: 45deg;
  background: var(--color-gold-400);
}

.hero-frame span:nth-child(1) {
  top: -3.5px;
  left: -3.5px;
}

.hero-frame span:nth-child(2) {
  top: -3.5px;
  right: -3.5px;
}

.hero-frame span:nth-child(3) {
  bottom: -3.5px;
  left: -3.5px;
}

.hero-frame span:nth-child(4) {
  bottom: -3.5px;
  right: -3.5px;
}

@media (min-width: 640px) {
  .hero-frame {
    inset: 1.85rem;
  }
}
</style>
