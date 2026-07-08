<script setup lang="ts">
defineProps<{ active: boolean; disabled?: boolean }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :aria-pressed="active"
    :aria-label="active ? 'Silenciar música' : 'Activar música'"
    class="group relative grid h-12 w-12 place-items-center rounded-full border border-primary/40 bg-surface-alt/60 text-primary backdrop-blur-sm transition hover:border-primary hover:bg-surface-alt/70 disabled:opacity-40"
    @click="$emit('toggle')"
  >
    <!-- Nota musical -->
    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path
        d="M9 17.5V6.75l9-1.8v9.3a2.75 2.75 0 1 1-1.5-2.45V7.1L10.5 8.3v9.2A2.75 2.75 0 1 1 9 17.5Z"
      />
    </svg>

    <!-- Ondas animadas cuando está activo -->
    <span
      v-if="active"
      aria-hidden="true"
      class="absolute inset-0 animate-ping rounded-full border border-primary/30"
    />
  </button>
</template>
