<script setup lang="ts">
import { EASE } from '~/utils/ease'

defineProps<{ monogram: string }>()
const emit = defineEmits<{ done: [] }>()

const { $gsap } = useNuxtApp()
const root = ref<HTMLElement>()
const mono = ref<HTMLElement>()
const line = ref<HTMLElement>()
const label = ref<HTMLElement>()
let ctx: ReturnType<typeof $gsap.context> | undefined

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    window.setTimeout(() => emit('done'), 500)
    return
  }

  ctx = $gsap.context(() => {
    const tl = $gsap.timeline({ onComplete: () => emit('done') })
    tl.from(mono.value!, { opacity: 0, y: 18, scale: 0.94, duration: 1, ease: EASE.elegant })
      .fromTo(
        line.value!,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: EASE.elegant },
        '-=0.45',
      )
      .from(label.value!, { opacity: 0, y: 8, duration: 0.7, ease: EASE.elegant }, '-=0.4')
      .to(root.value!, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, '+=0.7')
  })
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="root" class="flex flex-col items-center justify-center text-center">
    <p ref="mono" class="font-display text-7xl font-light tracking-wide text-primary sm:text-8xl">
      {{ monogram }}
    </p>
    <div ref="line" class="my-6 h-px w-24 origin-center bg-primary/50" aria-hidden="true" />
    <p ref="label" class="text-xs uppercase tracking-[0.5em] text-ink-soft/70">Nuestra Boda</p>
  </div>
</template>
