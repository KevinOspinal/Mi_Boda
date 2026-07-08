/**
 * Reactivo a la preferencia del sistema "reducir movimiento".
 * La experiencia usa esto para OMITIR la secuencia cinematográfica y mostrar
 * el contenido directamente (accesibilidad real, no decorativa).
 */
export function useReducedMotion() {
  const prefersReduced = ref(false)

  onMounted(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReduced.value = mq.matches

    const handler = (e: MediaQueryListEvent) => {
      prefersReduced.value = e.matches
    }
    mq.addEventListener('change', handler)
    onBeforeUnmount(() => mq.removeEventListener('change', handler))
  })

  return { prefersReduced }
}
