<script setup lang="ts">
// Divisor decorativo: dos tallos con hojas y un rombo central.
// `tone="night"` lo pasa a oro, para las bandas de fondo oscuro.
withDefaults(defineProps<{ tone?: 'default' | 'night' }>(), { tone: 'default' })
</script>

<template>
  <svg
    class="ornament"
    :class="{ 'is-night': tone === 'night' }"
    viewBox="0 0 200 28"
    fill="none"
    aria-hidden="true"
    preserveAspectRatio="xMidYMid meet"
  >
    <g stroke="currentColor" stroke-width="1" stroke-linecap="round">
      <line x1="24" y1="14" x2="80" y2="14" opacity="0.4" />
      <line x1="120" y1="14" x2="176" y2="14" opacity="0.4" />
    </g>
    <g fill="currentColor">
      <!-- hojas laterales -->
      <path d="M80 14c-7-4.5-14-4.5-21 0 7 4.5 14 4.5 21 0z" opacity="0.55" />
      <path d="M120 14c7-4.5 14-4.5 21 0-7 4.5-14 4.5-21 0z" opacity="0.55" />
      <!-- puntos extremos -->
      <circle cx="24" cy="14" r="1.5" opacity="0.5" />
      <circle cx="176" cy="14" r="1.5" opacity="0.5" />
    </g>
    <g class="ornament__gem">
      <!-- rombo central, en oro -->
      <path d="M100 4l6.5 10-6.5 10-6.5-10z" />
    </g>
  </svg>
</template>

<style scoped>
.ornament {
  display: block;
  width: clamp(120px, 42vw, 180px);
  height: auto;
  color: var(--color-primary);
}
.ornament__gem {
  fill: var(--color-gold-400);
}
.ornament.is-night {
  color: var(--color-gold-300);
}
.ornament.is-night .ornament__gem {
  fill: var(--color-gold-300);
}
</style>
