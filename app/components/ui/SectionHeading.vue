<script setup lang="ts">
withDefaults(
  defineProps<{
    kicker?: string
    title: string
    align?: 'center' | 'left'
  }>(),
  { align: 'center', kicker: undefined },
)
</script>

<template>
  <div :class="align === 'center' ? 'text-center' : 'text-left'">
    <p
      v-if="kicker"
      class="mb-5 text-[0.7rem] uppercase tracking-[0.45em] text-primary"
    >
      {{ kicker }}
    </p>
    <h2 class="font-display text-[2.6rem] font-light leading-[1.1] text-ink sm:text-6xl">
      {{ title }}
    </h2>
    <OrnamentDivider class="mt-6" :class="align === 'center' ? 'mx-auto' : ''" />
  </div>
</template>
