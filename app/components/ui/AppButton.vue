<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'outline' | 'ghost'
    tag?: string
    disabled?: boolean
  }>(),
  { variant: 'outline', tag: 'button', disabled: false },
)

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40'

const variants: Record<string, string> = {
  // El hover OSCURECE, no aclara: sobre primary-soft el texto blanco se queda
  // en 3.6:1 y no pasa AA. Con wine-600 sube a 9.4:1.
  primary: 'bg-primary text-white hover:bg-wine-600',
  outline: 'border border-primary/60 text-primary hover:bg-primary hover:text-white',
  ghost: 'text-ink-soft hover:text-ink',
}
</script>

<template>
  <component :is="tag" :class="[base, variants[variant]]" :disabled="tag === 'button' ? disabled : undefined">
    <slot />
  </component>
</template>
