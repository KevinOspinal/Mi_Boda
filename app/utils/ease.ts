/**
 * Presets de animación compartidos por toda la experiencia.
 * "elegant" es un CustomEase registrado en el plugin de GSAP (gsap.client.ts).
 */
export const EASE = {
  elegant: 'elegant',
  softInOut: 'power2.inOut',
  expoOut: 'expo.out',
  power: 'power3.out',
} as const

/** Equivalente CSS del ease de marca (para transiciones fuera de GSAP). */
export const CSS_EASE_ELEGANT = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Duraciones base, en segundos. Evita números mágicos dispersos. */
export const DURATION = {
  fast: 0.4,
  base: 0.8,
  slow: 1.2,
  cinematic: 1.8,
} as const

/** Desfase estándar para animaciones escalonadas (stagger). */
export const STAGGER = 0.08
