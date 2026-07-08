<script setup lang="ts">
import { DURATION, EASE } from '~/utils/ease'

/**
 * Envuelve contenido y lo revela suavemente al entrar en viewport (ScrollTrigger).
 * Si el usuario prefiere menos movimiento, muestra el contenido sin animar.
 */
const props = withDefaults(
  defineProps<{
    y?: number
    delay?: number
    duration?: number
    once?: boolean
  }>(),
  { y: 40, delay: 0, duration: DURATION.slow, once: true },
)

const el = ref<HTMLElement>()
const { $gsap } = useNuxtApp()
let ctx: ReturnType<typeof $gsap.context> | undefined

onMounted(() => {
  if (!el.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    $gsap.set(el.value, { opacity: 1, y: 0 })
    return
  }

  ctx = $gsap.context(() => {
    $gsap.from(el.value!, {
      opacity: 0,
      y: props.y,
      duration: props.duration,
      delay: props.delay,
      ease: EASE.elegant,
      scrollTrigger: {
        trigger: el.value,
        start: 'top 85%',
        once: props.once,
      },
    })
  })
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="el" class="will-change-[transform,opacity]">
    <slot />
  </div>
</template>
