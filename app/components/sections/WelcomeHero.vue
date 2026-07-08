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
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_35%,rgba(212,106,136,0.12),transparent_70%)]"
    />

    <!-- Acentos botánicos -->
    <BotanicalSprig
      aria-hidden="true"
      class="pointer-events-none absolute -left-4 top-10 w-20 -rotate-12 opacity-70 sm:left-6 sm:w-28"
    />
    <BotanicalSprig
      aria-hidden="true"
      class="pointer-events-none absolute -right-4 bottom-24 w-20 rotate-[168deg] opacity-70 sm:right-6 sm:w-28"
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

    <div data-reveal class="absolute bottom-8 flex flex-col items-center gap-2">
      <span class="text-[0.65rem] uppercase tracking-[0.3em] text-ink-soft/50">Desliza</span>
      <span class="h-8 w-px animate-pulse bg-primary/40" aria-hidden="true" />
    </div>
  </section>
</template>
