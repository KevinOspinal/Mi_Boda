<script setup lang="ts">
// Vestido y traje colgados en perchas (línea fina). Hereda el color con currentColor.
</script>

<template>
  <div class="flex items-end justify-center gap-1" aria-hidden="true">
    <!-- Vestido -->
    <svg
      viewBox="0 0 100 200"
      class="h-auto w-1/2"
      fill="none"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M50 16c6-1 8 4 3 7" />
      <path d="M50 23 30 41h40z" />
      <path d="M32 40l10 15" />
      <path d="M68 40 58 55" />
      <path d="M42 55l8 8 8-8" />
      <path d="M42 55c-4 23-5 35-2 45" />
      <path d="M58 55c4 23 5 35 2 45" />
      <path d="M40 100c6 5 14 5 20 0" />
      <path d="M40 100 24 176" />
      <path d="M60 100 76 176" />
      <path d="M24 176c14 12 38 12 52 0" />
      <path d="M45 108 41 173" stroke-opacity=".45" />
      <path d="M55 108 59 173" stroke-opacity=".45" />
    </svg>

    <!-- Traje -->
    <svg
      viewBox="0 0 100 200"
      class="h-auto w-1/2"
      fill="none"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M50 16c6-1 8 4 3 7" />
      <path d="M50 23 28 41h44z" />
      <path d="M30 41c-6 34-4 97 0 131" />
      <path d="M70 41c6 34 4 97 0 131" />
      <path d="M30 172c6 3 12 4 18 4" />
      <path d="M70 172c-6 3-12 4-18 4" />
      <path d="M42 44l8 10 8-10" />
      <path d="M50 54 40 70l6 30" />
      <path d="M50 54 60 70l-6 30" />
      <path d="M46 100 48 176" />
      <path d="M54 100 52 176" />
      <path d="M50 54 45 50v8z" fill="currentColor" stroke="none" />
      <path d="M50 54 55 50v8z" fill="currentColor" stroke="none" />
      <circle cx="50" cy="118" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="50" cy="138" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  </div>
</template>
