/**
 * Estallido de confeti hecho con GSAP (sin dependencias externas).
 * Respeta `prefers-reduced-motion` y limpia el DOM al terminar.
 */
export function useConfetti() {
  const { $gsap } = useNuxtApp()

  const COLORS = ['#d46a88', '#e488a3', '#f6d3de', '#ffffff', '#eeaec2']

  function burst(count = 90) {
    if (import.meta.server) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const container = document.createElement('div')
    container.setAttribute('aria-hidden', 'true')
    container.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden'
    document.body.appendChild(container)

    const cx = window.innerWidth / 2
    const cy = window.innerHeight * 0.42
    const vh = window.innerHeight

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div')
      const size = 6 + Math.random() * 8
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      piece.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${size}px;height:${
        size * (0.5 + Math.random())
      }px;background:${color};border-radius:${Math.random() > 0.5 ? '9999px' : '1px'};will-change:transform,opacity`
      container.appendChild(piece)

      const angle = Math.random() * Math.PI * 2
      const velocity = 120 + Math.random() * 260
      const dx = Math.cos(angle) * velocity
      const dy = Math.sin(angle) * velocity - 160

      $gsap
        .timeline()
        .to(piece, { x: dx, y: dy, duration: 0.6, ease: 'power2.out' })
        .to(
          piece,
          {
            y: `+=${vh}`,
            x: `+=${(Math.random() - 0.5) * 120}`,
            rotation: (Math.random() - 0.5) * 720,
            opacity: 0,
            duration: 1.6 + Math.random(),
            ease: 'power1.in',
          },
          '-=0.1',
        )
    }

    window.setTimeout(() => container.remove(), 3200)
  }

  return { burst }
}
