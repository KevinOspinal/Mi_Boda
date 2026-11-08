<script setup lang="ts">
// Ramita botánica en línea fina para acentos decorativos (esquinas, hero, cierre).
// `tone="night"` la aclara, para las bandas de fondo oscuro.
withDefaults(defineProps<{ tone?: 'default' | 'night' }>(), { tone: 'default' })
</script>

<template>
  <svg
    class="sprig"
    :class="{ 'is-night': tone === 'night' }"
    viewBox="0 0 100 220"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M52 216 C47 178 55 152 50 120 C46 92 55 62 50 24"
      stroke="currentColor"
      stroke-width="1.3"
      stroke-linecap="round"
      opacity="0.5"
    />
    <g fill="currentColor" opacity="0.4">
      <ellipse cx="38" cy="176" rx="11" ry="4.2" transform="rotate(-38 38 176)" />
      <ellipse cx="64" cy="160" rx="11" ry="4.2" transform="rotate(38 64 160)" />
      <ellipse cx="36" cy="140" rx="10" ry="4" transform="rotate(-42 36 140)" />
      <ellipse cx="63" cy="122" rx="10" ry="4" transform="rotate(42 63 122)" />
      <ellipse cx="38" cy="100" rx="9" ry="3.6" transform="rotate(-40 38 100)" />
      <ellipse cx="62" cy="82" rx="9" ry="3.6" transform="rotate(40 62 82)" />
      <ellipse cx="42" cy="60" rx="7.5" ry="3" transform="rotate(-42 42 60)" />
      <ellipse cx="58" cy="44" rx="7.5" ry="3" transform="rotate(42 58 44)" />
      <ellipse cx="50" cy="27" rx="6" ry="2.6" />
    </g>
  </svg>
</template>

<style scoped>
.sprig {
  display: block;
  height: auto;
  color: var(--color-primary);
}
.sprig.is-night {
  color: var(--color-on-night-soft);
}
</style>
